import { Controller } from '@nestjs/common';

import { ENDPOINT } from '@/constants';

@Controller(ENDPOINT.Permission.Base)
export class PermissionController {}
