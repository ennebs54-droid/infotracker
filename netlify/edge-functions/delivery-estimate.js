export default async (request, context) => {
  const country = context.geo?.country?.code || 'US';

  const offsets = {
    GB: 3, IE: 3, FR: 4, DE: 4, NL: 4, BE: 4, ES: 5, IT: 5, PT: 5,
    US: 5, CA: 5, MX: 6,
    AU: 7, NZ: 7, JP: 7, CN: 7, IN: 7, SG: 6, AE: 6, SA: 6,
    BR: 7, AR: 7, ZA: 8
  };

  const days = offsets[country] ?? 6;
  const date = new Date();
  date.setDate(date.getDate() + days);

  return new Response(JSON.stringify({
    estimatedDelivery: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    country
  }), { headers: { 'Content-Type': 'application/json' } });
};

export const config = { path: '/api/delivery-estimate' };
