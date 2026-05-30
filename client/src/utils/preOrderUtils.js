export const getAdminScanUrl = (token) => {
  const base = window.location.origin;
  return `${base}/admin/scan/${token}`;
};

export const getQrImageUrl = (url) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

export const extractPreOrderToken = (input) => {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/\/(?:admin\/scan|preorder)\/([a-f0-9]+)/i);
  if (fromUrl) return fromUrl[1];
  if (/^[a-f0-9]{32}$/i.test(trimmed)) return trimmed;
  return null;
};
