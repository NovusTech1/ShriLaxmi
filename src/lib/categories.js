export const DEFAULT_CATEGORIES = [
  "Short Kurti",
  "Long Kurti",
  "Cord Set",
  "One Piece",
  "3 Piece Sets",
  "Bedsheets",
  "Pants",
  "Dress Materials"
];

/**
 * Fetch categories from Supabase, or fall back to DEFAULT_CATEGORIES if table is not configured or empty.
 */
export async function fetchCategories(supabaseClient) {
  if (!supabaseClient) {
    return DEFAULT_CATEGORIES.map((name, idx) => ({ id: `default-${idx}`, name, is_default: true }));
  }

  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_CATEGORIES.map((name, idx) => ({ id: `default-${idx}`, name, is_default: true }));
    }

    return data;
  } catch (err) {
    console.error("fetchCategories fallback:", err);
    return DEFAULT_CATEGORIES.map((name, idx) => ({ id: `default-${idx}`, name, is_default: true }));
  }
}
