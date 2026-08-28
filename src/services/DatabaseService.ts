import { requireSupabase } from '@/lib/supabase'
import { DEFAULT_PAGE_SIZE } from '@/config'
import type { Memory, MemoryFilters, SortMode, AppSettings } from '@/types'

// Semua query Postgres lewat file ini. Komponen tidak pernah memanggil
// supabase.from(...) langsung, supaya backend bisa diganti tanpa menulis ulang UI,
// dan supaya kita punya satu tempat untuk menegakkan pagination/optimized query.
export interface PagedResult<T> {
  items: T[]
  total: number
  hasMore: boolean
}

function applyFilters(query: any, filters: MemoryFilters) {
  if (filters.search) {
    const q = filters.search.trim()
    // Cari di title/description/location; tags & category dicek terpisah di bawah
    // karena or() Supabase tidak bisa menggabungkan ilike text dengan contains array dengan rapi.
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%,category.ilike.%${q}%`
    )
  }
  if (filters.type === 'image' || filters.type === 'video') {
    query = query.eq('media_type', filters.type)
  }
  if (filters.type === 'favorites') {
    query = query.eq('is_favorite', true)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date()
    let from: Date | null = null
    if (filters.dateRange === 'today') from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (filters.dateRange === 'week') from = new Date(now.getTime() - 7 * 86400000)
    if (filters.dateRange === 'month') from = new Date(now.getFullYear(), now.getMonth(), 1)
    if (filters.dateRange === 'year') from = new Date(now.getFullYear(), 0, 1)
    if (filters.dateRange === 'custom' && filters.customFrom) from = new Date(filters.customFrom)
    if (from) query = query.gte('captured_at', from.toISOString())
    if (filters.dateRange === 'custom' && filters.customTo) {
      query = query.lte('captured_at', new Date(filters.customTo).toISOString())
    }
  }
  return query
}

function sortColumn(sort: SortMode): { column: string; ascending: boolean } {
  switch (sort) {
    case 'oldest':
      return { column: 'captured_at', ascending: true }
    case 'custom':
      return { column: 'sort_order', ascending: true }
    case 'random':
      // Random sejati di Postgres (order by random()) mahal untuk tabel besar;
      // untuk galeri publik kita random-kan di client dari halaman yang sudah diambil,
      // supaya tetap ringan pada free tier.
      return { column: 'captured_at', ascending: false }
    case 'newest':
    default:
      return { column: 'captured_at', ascending: false }
  }
}

class DatabaseServiceImpl {
  async listMemories(opts: {
    filters?: MemoryFilters
    sort?: SortMode
    page?: number
    pageSize?: number
  }): Promise<PagedResult<Memory>> {
    const client = requireSupabase()
    const page = opts.page ?? 0
    const pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE
    const from = page * pageSize
    const to = from + pageSize - 1

    let query = client.from('memories').select('*', { count: 'exact' })
    if (opts.filters) query = applyFilters(query, opts.filters)
    const { column, ascending } = sortColumn(opts.sort ?? 'newest')
    query = query.order(column, { ascending }).range(from, to)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)
    const items = (data ?? []) as Memory[]
    const total = count ?? items.length
    return { items, total, hasMore: from + items.length < total }
  }

  async getMemory(id: string): Promise<Memory | null> {
    const client = requireSupabase()
    const { data, error } = await client.from('memories').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data as Memory | null
  }

  async incrementViews(id: string): Promise<void> {
    const client = requireSupabase()
    // RPC atomik di database (lihat schema.sql: increment_memory_views) —
    // menghindari race condition dari read-then-write di client.
    await client.rpc('increment_memory_views', { memory_id: id })
  }

  async getRandomMemory(): Promise<Memory | null> {
    const client = requireSupabase()
    const { data, error } = await client.rpc('get_random_memory')
    if (error) throw new Error(error.message)
    const row = Array.isArray(data) ? data[0] : data
    return (row as Memory) ?? null
  }

  async createMemory(payload: Omit<Memory, 'created_at' | 'views' | 'is_favorite'>): Promise<Memory> {
    const client = requireSupabase()
    const { data, error } = await client
      .from('memories')
      .insert({ ...payload, is_favorite: false, views: 0 })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data as Memory
  }

  async updateMemory(id: string, patch: Partial<Memory>): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from('memories').update(patch).eq('id', id)
    if (error) throw new Error(error.message)
  }

  async bulkUpdate(ids: string[], patch: Partial<Memory>): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from('memories').update(patch).in('id', ids)
    if (error) throw new Error(error.message)
  }

  async deleteMemories(ids: string[]): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from('memories').delete().in('id', ids)
    if (error) throw new Error(error.message)
  }

  async setFavorite(id: string, value: boolean): Promise<void> {
    const client = requireSupabase()
    // Publik hanya boleh memanggil RPC toggle_favorite (lihat schema.sql), bukan UPDATE langsung —
    // RPC ini membatasi kolom yang bisa diubah supaya tidak membuka celah manipulasi data lain.
    const { error } = await client.rpc('toggle_favorite', { memory_id: id, value })
    if (error) throw new Error(error.message)
  }

  async listCategories(): Promise<string[]> {
    const client = requireSupabase()
    const { data, error } = await client.from('memories').select('category').not('category', 'is', null)
    if (error) throw new Error(error.message)
    const set = new Set((data ?? []).map((r: any) => r.category as string))
    return Array.from(set).sort()
  }

  async getTimeline(): Promise<Memory[]> {
    const client = requireSupabase()
    const { data, error } = await client.from('memories').select('*').order('captured_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []) as Memory[]
  }

  async getSettings(): Promise<AppSettings | null> {
    const client = requireSupabase()
    const { data, error } = await client.from('app_settings').select('*').eq('id', 1).maybeSingle()
    if (error) throw new Error(error.message)
    return data as AppSettings | null
  }

  async updateSettings(patch: Partial<AppSettings>): Promise<void> {
    const client = requireSupabase()
    const { error } = await client.from('app_settings').update(patch).eq('id', 1)
    if (error) throw new Error(error.message)
  }

  async exportManifest(format: 'json' | 'csv'): Promise<string> {
    const client = requireSupabase()
    const { data, error } = await client
      .from('memories')
      .select('id,title,description,media_url,captured_at,category,tags')
      .order('captured_at', { ascending: false })
    if (error) throw new Error(error.message)
    const rows = data ?? []
    if (format === 'json') return JSON.stringify(rows, null, 2)
    const header = 'id,title,description,media_url,captured_at,category,tags\n'
    const csv = rows
      .map((r: any) =>
        [r.id, r.title, r.description ?? '', r.media_url, r.captured_at, r.category ?? '', (r.tags ?? []).join('|')]
          .map((v: string) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')
    return header + csv
  }
}

export const DatabaseService = new DatabaseServiceImpl()
