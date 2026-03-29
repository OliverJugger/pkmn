import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private translations$ = new BehaviorSubject<Record<string, string>>({});

  constructor() {
    this.http.get<Record<string, string>>(`pokemon-translations.json?t=${Date.now()}`).subscribe({
      next: (data) => this.translations$.next(data),
      error: () => console.warn('TranslationService : fichier pokemon-translations.json introuvable.')
    });
  }

  /** Retourne le nom français, ou le nom anglais en fallback */
  translate(name: string): Observable<string> {
    return this.translations$.pipe(
      map(t => t[name] ?? name)
    );
  }
}
