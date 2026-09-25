// Directus-style translations: [{ languages_code, …fields }]. German comes from the record itself,
// English from content/manual/translations/listings.en.json (machine translated, flagged as such).

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function translationKey(listing) {
  return listing.source === 'grandtower' ? `gt-${listing.legacy_id}` : String(listing.legacy_id)
}

export function withTranslations(listing, enMap) {
  const en = enMap[translationKey(listing)]
  const translations = [
    { languages_code: 'de', title: listing.title, teaser: listing.teaser, description: listing.description, machine_translated: false },
  ]
  if (en) {
    translations.push({
      languages_code: 'en',
      title: en.title,
      teaser: en.teaser,
      description: (en.description || []).map((p) => `<p>${esc(p)}</p>`).join(''),
      machine_translated: true,
    })
  }
  return { listing: { ...listing, translations }, missing: !en }
}
