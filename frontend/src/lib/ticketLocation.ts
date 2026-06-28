export const getTicketNumberFromLocation = (location: Location) => {
  const currentUrl = new URL(location.href);
  const queryTicket = currentUrl.searchParams.get('t');

  if (queryTicket) {
    return queryTicket;
  }

  const hash = currentUrl.hash.startsWith('#') ? currentUrl.hash.slice(1) : currentUrl.hash;

  if (!hash) {
    return '';
  }

  const questionIndex = hash.indexOf('?');
  if (questionIndex === -1) {
    return '';
  }

  return new URLSearchParams(hash.slice(questionIndex + 1)).get('t') ?? '';
};

export const buildTicketStatusUrl = (ticketNumber: string, location: Location) => {
  const baseUrl = `${location.origin}${location.pathname}`;
  return `${baseUrl}#user?t=${encodeURIComponent(ticketNumber)}`;
};