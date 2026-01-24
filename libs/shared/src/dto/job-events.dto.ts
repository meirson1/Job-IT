export class JobUpsertedEventDto {
  operation: 'created' | 'updated';
  id: number;
  externalId: string;
}

export class JobDeletedEventDto {
  id: number;
  externalId: string;
}
