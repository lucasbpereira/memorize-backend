import { SetMetadata } from '@nestjs/common';

export const USERS_CUSTOM_REPOSITORY = 'USERS_CUSTOM_REPOSITORY';

// eslint-disable-next-line @typescript-eslint/ban-types
export function CustomRepository(entity: Function): ClassDecorator {
  return SetMetadata(USERS_CUSTOM_REPOSITORY, entity);
}
