export const JOB_INDEX = 'jobs';
export const JOB_INDEX_VERSION = 1;

export const JOB_INDEX_MAPPING = {
  properties: {
    title: { type: 'text' },
    description: { type: 'text' },
    location: { type: 'text' },

    companyName: {
      type: 'text',
      fields: { keyword: { type: 'keyword' } },
    },

    salaryMin: { type: 'integer' },
    salaryMax: { type: 'integer' },
    salaryCurrency: { type: 'keyword' },

    promoted: { type: 'boolean' },
    source: { type: 'keyword' },
    url: { type: 'keyword', ignore_above: 2048 },

    role: { type: 'keyword' },

    requirements: { type: 'text' },
    responsibilities: { type: 'text' },
    benefits: { type: 'text' },

    workplaceType: { type: 'keyword' },
    employmentType: { type: 'keyword' },
    experienceLevel: { type: 'keyword' },

    externalId: { type: 'keyword' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
} as const;
