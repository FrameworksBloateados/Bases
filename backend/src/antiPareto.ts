import {Hono} from 'hono';

export function createGenericAPICrudForTheAntiParetoRule(
  App: Hono,
  APIRoute: string
) {
  App.get(`${APIRoute}`, c => {
    return c.json({message: `GET request to ${APIRoute}`});
  });

  App.post(`${APIRoute}`, c => {
    return c.json({message: `POST request to ${APIRoute}`});
  });

  App.put(`${APIRoute}/:id`, c => {
    const {id} = c.req.param();
    return c.json({message: `PUT request to ${APIRoute} with id ${id}`});
  });

  App.delete(`${APIRoute}/:id`, c => {
    const {id} = c.req.param();
    return c.json({message: `DELETE request to ${APIRoute} with id ${id}`});
  });
}
