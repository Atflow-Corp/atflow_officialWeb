
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const INITIAL_PLACEHOLDERS = [
  "Design a CBT-based emotion diary",
  "Create a meditation timer for high-stress events",
  "Build a healthcare research dashboard",
  "Generate a clinical survey interface",
  "Design an ACT skill-building module",
  "Create a visualization for longitudinal stress data",
  "Make a therapeutic breathing guide",
  "Design a patient tracking system for clinics"
];

export interface ProductInfo {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  tags: string[];
  iconColor: string;
  screenshots: string[];
  appStoreLink: string;
  playStoreLink?: string;
}

export const PRODUCTS: ProductInfo[] = [
  /* {
       id: 'design-lab',
       title: "Product Design Lab",
       shortDesc: "An AI-powered design environment where mental healthcare concepts come to life.",
       longDesc: "Rapidly prototype empathetic interfaces for patients and providers. Our Design Lab leverages specialized LLMs trained on therapeutic design patterns (CBT, ACT) to help researchers and clinicians visualize digital interventions in minutes rather than weeks.",
       tags: ["AI Design", "Prototyping", "UI/UX"],
       iconColor: "linear-gradient(135deg, #2dd4bf, #a855f7)",
       screenshots: ["https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=600"],
       appStoreLink: "#"
   },*/
  {
    id: 'purple-whale',
    title: "Purple Whale",
    shortDesc: "Your immersive sanctuary for navigating life's waves.",
    longDesc: "Built on the principles of CBT and ACT, Purple Whale offers more than just meditation. It intelligently adapts to your long-term stress patterns, providing evidence-based tools to help you regain balance and focus. A digital therapeutic companion for Somatic Symptom Disorder. We integrated CBT, ACT, and MBSR protocols to help users manage physical distress caused by psychological factors, currently undergoing clinical trials.",
    tags: ["Meditation", "CBT", "ACT", "Mind-body Care"],
    iconColor: "linear-gradient(135deg, #a855f7, #6366f1)",
    screenshots: [`${import.meta.env.BASE_URL}img/mock_pw.png`],
    appStoreLink: "https://apps.apple.com/kr/app/%ED%8D%BC%ED%94%8C%EC%9B%A8%EC%9D%BC-purple-whale/id6478949979",
    playStoreLink: "https://play.google.com/store/apps/details?id=com.purplewhale"
  },
  {
    id: 'research-flow',
    title: "Research Flow",
    shortDesc: "Revolutionizing healthcare data with automated survey deployment.",
    longDesc: "A specialized SaaS solution for clinical data collection. It optimizes the complex workflow of medical surveys and case report forms (CRF), enabling researchers to focus on insights rather than administration.",
    tags: ["B2B", "Survey Automation", "Clinical"],
    iconColor: "linear-gradient(135deg, #3b82f6, #2dd4bf)",
    screenshots: [`${import.meta.env.BASE_URL}img/mock_research.png`],
    appStoreLink: "https://researchflow.kr/"
  }
];

export const PORTFOLIO_DATA = [
  {
    title: "Purple Whale",
    client: "Owner & Developer (Self-developed)",
    description: "A digital therapeutic companion for Somatic Symptom Disorder. We integrated CBT, ACT, and MBSR protocols to help users manage physical distress caused by psychological factors, currently undergoing clinical trials.",
    tags: ["B2C/B2B2C", "AI", "Clinical Trials", "Somatic Care"]
  },
  {
    title: "Research Flow",
    client: "Owner & Developer (Self-developed)",
    description: "A specialized SaaS solution for clinical data collection. It optimizes the complex workflow of medical surveys and case report forms (CRF), enabling researchers to focus on insights rather than administration.",
    tags: ["B2B", "Digital Therapeutics", "Clinical Research", "CRF Automation"]
  },
  {
    title: "Cancer Survivors Recovery Support",
    client: "Yonsei Cancer Center (Co-developed)",
    description: "Digitalizing the post-surgery journey for cancer survivors. We designed a system and recovery guides to support the mental wellness of patients returning to daily life after surgery.",
    tags: ["Post-op Care", "Mental Wellness", "Digital Therapeutics"]
  },
  {
    title: "Telemedicine & NGS Platform",
    client: "Severance Hospital (Yonsei Univ. Health System)",
    description: "VBuilding the infrastructure for next-generation medical collaboration. We architected a remote consultation platform and an NGS (Next-Generation Sequencing) genetic test system to resolve unmet medical needs.",
    tags: ["Telemedicine", "Genetics", "Complex System Design"]
  },

];

export const CAREER_DATA = [
  /*  {
      role: "AI Research Engineer",
      type: "Full-time",
      location: "Seoul / Remote",
      description: "Develop proprietary LLM pipelines for empathetic therapeutic interaction."
    },
    {
      role: "Digital Therapeutics Designer",
      type: "Full-time",
      location: "Seoul",
      description: "Lead UI/UX for Purple Whale, focusing on CBT and ACT methodologies."
    },*/
  {
    role: "Now we don't have any openings, but we are always looking for talented people to join our team.",
    /*type: "Full-time",
    location: "Seoul / Hybrid",
    description: "Scale Research Flow's backend tracking systems and survey automation."*/
  }
];
