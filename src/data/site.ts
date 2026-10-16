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
    { label: 'Approach', href: '/#approach' },
    { label: 'Contact', href: '/#contact' },
  ] satisfies NavItem[],

  intro: {
    // The h1 is "Interiors that think ahead." with the highlight in navy.
    headline: { before: 'Interiors that ', highlight: 'think ahead', after: '.' },
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

  // Landing section. Source: docs/ABOUT US.docx, shortened.
  about: {
    statement:
      'ZB Design is a leading interior design company in Kuala Lumpur, built on sustainable architecture and environmental friendliness.',
    story:
      'From family homes to shops and offices, we handle the whole job, from the first sketch to handover: design, renovation, carpentry and painting, with smart home systems where they help.',
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
      },
      {
        number: '02',
        title: 'House renovation',
        description:
          'Full and partial renovations for apartments, terrace houses, semi-ds and bungalows.',
      },
      {
        number: '03',
        title: 'Retail shop renovation',
        description: 'Shop and showroom fit-outs planned around your opening date.',
      },
      {
        number: '04',
        title: 'Carpentry',
        description: 'Custom cabinets, wardrobes, feature walls and built-ins, made to measure.',
      },
      {
        number: '05',
        title: 'Painting',
        description:
          'Interior and exterior painting, using low-emission paints for healthier rooms.',
      },
    ] satisfies Service[],
    note: 'Other renovation work on request. Every project starts with a free consultation.',
  },

  // Source: docs/ABOUT US.docx, "Our core concepts and strengths".
  approach: {
    statement: 'Six ideas guide every space we design.',
    items: [
      {
        title: 'Sustainable architecture',
        description:
          'Green building principles, renewable materials and less waste on every project.',
      },
      {
        title: 'Environmental friendliness',
        description:
          'Eco-friendly materials, non-toxic paints and low-emission furnishings for healthier rooms.',
      },
      {
        title: 'Energy efficiency',
        description:
          'Smart lighting and passive heating and cooling that cut the energy a space uses.',
      },
      {
        title: 'Natural light and ventilation',
        description:
          'Daylight and fresh air first, so rooms need less lighting and air conditioning.',
      },
      {
        title: 'Sustainable furnishings',
        description: 'Durable, responsibly made furniture that looks good and lasts.',
      },
      {
        title: 'Biophilic design',
        description: 'Natural materials, greenery and open views that bring calm indoors.',
      },
    ] satisfies TitledItem[],
    credentialsLabel: 'Credentials',
    credentials:
      'Architectural certification · Smart home system competency · Licensed construction specialist [add registration no.]',
  },

  // Source: docs/OUR PHILOSOPHY.docx
  // Source: docs/OUR PHILOSOPHY.docx, shortened.
  philosophy: {
    statement:
      'We create living spaces and buildings shaped by sustainable architecture and care for the environment.',
    body: "Beauty and sustainability can live together. Our team's approach has earned us a reputation for spaces that are not only stunning, but also give back to the environment.",
    designer: { name: 'Zulbakri', role: 'Chief Designer' },
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
      'Selected interior projects from 2021 to 2023, shown from first 3D design to finished space.',
    description:
      'Interior design and renovation projects by ZB Design, shown from first 3D design to finished space.',
  },

  // Set to false once real photography replaces the generated placeholders.
  showPlaceholderLabels: true,
} as const;

export function formatAddress(a: typeof site.contact.address): string {
  return `${a.street}, ${a.locality}, ${a.postalCode} ${a.city}`;
}
