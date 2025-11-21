import {validator as zValidator, describeRoute} from 'hono-openapi';

export interface RouteDocumentation {
  describer: describeRoute;
  validator: zValidator;
}

export type RouteDocumentationWithoutValidator = Omit<
  RouteDocumentation,
  'validator'
>;
