export const normalizeDomainInput = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/^https?:\/\//, '')
  .replace(/^www\./, '')
  .replace(/\/$/, '');

// export const formatDate = (value?: string) => {
//   if (!value) return '-';

//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) {
//     return value.split('T')[0] || value;
//   }

//   return date.toISOString().split('T')[0];
// };

// export const mapDomainItem = (item: DomainApiItem): DomainItem => ({
//   id: item.id || `${item.name || 'domain'}:${item.created_at || ''}`,
//   name: item.name || '',
//   addedAt: formatDate(item.created_at),
// });
