export const JOB_INDEX = 'jobs';
export const JOB_INDEX_VERSION = 1;

export const JOB_INDEX_MAPPING = {
  properties: {
    title: { type: 'text' },
    description: { type: 'text' },
    requirements: { type: 'text' },
    responsibilities: { type: 'text' },

    location: { type: 'text' },

    salaryMin: { type: 'integer' },
    salaryMax: { type: 'integer' },

    workplaceType: { type: 'keyword' },
    employmentType: { type: 'keyword' },
    experienceLevel: { type: 'keyword' },

    promoted: { type: 'boolean' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
} as const;
