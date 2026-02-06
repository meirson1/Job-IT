export const JOB_INDEX = 'jobs';
export const JOB_INDEX_VERSION = 1;

export const JOB_INDEX_MAPPING = {
  properties: {
    title: { type: 'text' },
    requirements: { type: 'text' },

    location: { type: 'text' },

    workplaceType: { type: 'keyword' },
    employmentType: { type: 'keyword' },
    experienceLevel: { type: 'keyword' },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
} as const;
