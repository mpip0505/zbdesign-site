// All site-wide copy and company details (source: docs/zb-design-copy-deck.md).
// Anything in [brackets] still needs confirming with the client.

export interface NavItem {
  label: string;
  href: string;
}

export interface Service {
  number: string;
  title: string;
  description: string;
  includes: string[];
}

export interface TitledItem {
  title: string;
  description: string;
}

export const site = {
  name: 'ZB Design',
  legalName: 'ZB Design Sdn. Bhd.',
  title: 'ZB Design | Interior Design and Renovation in Kuala Lumpur',
  description:
    'Interior design, renovation and smart home systems for homes, shops and offices in Kuala Lumpur. Book a free consultation.',
  year: 2026,

  nav: [
    { label: 'Projects', href: '/projects/' },
    { label: 'About', href: '/#about' },
    { label: 'Services', href: '/#services' },
    { label: 'Expertise', href: '/#expertise' },
    { label: 'Contact', href: '/#contact' },
  ] satisfies NavItem[],

  intro: {
    // The h1 is "Interiors that think ahead." with the highlight in navy.
    headline: { before: 'Interiors that ', highlight: 'think ahead', after: '.' },
    supporting:
      'Interior design, renovation and smart home systems for homes and workplaces in Kuala Lumpur.',
    meta: ['Interior Design', 'Renovation', 'Smart Home'],
    cta: { label: 'Book a free consultation', href: '/#contact' },
  },

  marquee: [
    'Interior Design',
    'House Renovation',
    'Retail Fit-out',
    'Carpentry',
    'Painting',
    'Smart Home',
  ],

  about: {
    statement:
      'ZB Design is an interior design and renovation company. We design spaces that feel good to live and work in, and build them to last.',
    story:
      'From family homes to shops and offices, we look after the whole job, from the first sketch to handover: design, carpentry, painting and renovation, with smart home systems where they help. We favour daylight, fresh air and materials that last, and we work to the budget and schedule we agree at the start.',
    workingWithUs: [
      'Made to your brief',
      'Clear communication',
      'Practical design',
      'Budget kept in view',
      'Careful workmanship',
      'Schedules we stick to',
    ],
    facts: [
      { label: 'In practice', value: '[25 or 30+ years]' },
      { label: 'Based in', value: 'Taman Melawati, Kuala Lumpur' },
      { label: 'Company', value: 'ZB Design Sdn. Bhd.' },
    ],
  },

  services: {
    statement: 'One team for design, build and the technology inside.',
    items: [
      {
        number: '01',
        title: 'Interior design',
        description:
          'Layouts, finishes, lighting and furniture, planned in 3D before anything is built.',
        includes: [
          '3D design visuals',
          'Materials and finishes',
          'Lighting plans',
          'Furniture layout',
        ],
      },
      {
        number: '02',
        title: 'House renovation',
        description:
          'Full and partial renovations for apartments, terrace houses, semi-ds and bungalows.',
        includes: [
          'Layout changes',
          'Kitchens and bathrooms',
          'Flooring and ceilings',
          'Electrical and plumbing coordination',
        ],
      },
      {
        number: '03',
        title: 'Retail shop renovation',
        description: 'Shop and showroom fit-outs planned around your opening date.',
        includes: [
          'Shopfront and interior',
          'Display and joinery',
          'Lighting',
          'Signage coordination',
        ],
      },
      {
        number: '04',
        title: 'Carpentry',
        description: 'Custom cabinets, wardrobes, feature walls and built-ins, made to measure.',
        includes: ['Kitchen cabinets', 'Wardrobes', 'Wall panelling', 'Built-in storage'],
      },
      {
        number: '05',
        title: 'Painting',
        description:
          'Interior and exterior painting, using low-emission paints for healthier rooms.',
        includes: ['Surface preparation', 'Interior', 'Exterior', 'Feature finishes'],
      },
    ] satisfies Service[],
    note: 'Other renovation work on request. Every project starts with a free consultation.',
  },

  expertise: {
    statement: 'How we approach every space.',
    items: [
      {
        title: 'Natural light and ventilation',
        description:
          'Layouts that welcome daylight and airflow, so rooms feel better and cost less to run.',
      },
      {
        title: 'Materials that last',
        description:
          'Durable, responsibly made materials and low-emission finishes for healthier rooms.',
      },
      {
        title: 'Biophilic design',
        description: 'Natural materials, greenery and views that bring calm indoors.',
      },
      {
        title: 'Smart home systems',
        description:
          'Lighting and controls planned into the design from the start, so the technology stays out of sight.',
      },
    ] satisfies TitledItem[],
    credentialsLabel: 'Credentials',
    credentials:
      'Architectural certification · Smart home system competency · Licensed construction specialist [add registration no.]',
  },

  contact: {
    lead: "Let's talk about your space. Tell us what you have in mind and we'll arrange a free consultation and site visit.",
    email: 'zul@zbdesign.com.my',
    phone: { display: '019-674 1864', tel: '+60196741864' },
    address: {
      street: 'No. 234B & 234C, Jalan Bandar 13',
      locality: 'Taman Melawati',
      postalCode: '53100',
      city: 'Kuala Lumpur',
      country: 'MY',
    },
    consultation: { label: 'Free consultation', value: 'Homes, shops and offices' },
  },

  projectsPage: {
    title: 'Projects',
    intro:
      'Selected interior projects from 2020 to 2023, shown from first 3D design to finished space.',
    description:
      'Interior design and renovation projects by ZB Design, shown from first 3D design to finished space.',
  },

  // Set to false once real photography replaces the generated placeholders.
  showPlaceholderLabels: true,
} as const;

export function formatAddress(a: typeof site.contact.address): string {
  return `${a.street}, ${a.locality}, ${a.postalCode} ${a.city}`;
}
