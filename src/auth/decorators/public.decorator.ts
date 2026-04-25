import { SetMetadata } from '@nestjs/common';
import { MetadataKey } from '../constants';

export const Public = () => SetMetadata(MetadataKey.IS_PUBLIC_KEY, true);