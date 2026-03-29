import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes(environment.apiUrl) && environment.apiKey) {
    const cloned = req.clone({
      headers: req.headers.set('X-Api-Key', environment.apiKey)
    });
    return next(cloned);
  }
  return next(req);
};
