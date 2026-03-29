import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PersonalCollectionService {
  private readonly http = inject(HttpClient);

  // Set des noms de Pokémon possédés (lecture insensible à la casse)
  private ownedNames$ = new BehaviorSubject<Set<string>>(new Set());

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile(): void {
    // Ajoute un cache-buster pour toujours lire la version à jour du fichier
    const url = `ma-collection.txt?t=${Date.now()}`;
    this.http.get(url, { responseType: 'text' }).subscribe({
      next: (text) => {
        const names = new Set(
          text
            .split('\n')
            .map(line => line.trim().toLowerCase())
            .filter(line => line.length > 0)
        );
        this.ownedNames$.next(names);
      },
      error: () => {
        console.warn('PersonalCollectionService : fichier ma-collection.txt introuvable.');
      }
    });
  }

  /** Recharge le fichier (utile si tu le modifies à chaud) */
  reload(): void {
    this.loadFromFile();
  }

  /** Nombre de lignes dans ma-collection.txt */
  ownedCount$: Observable<number> = this.ownedNames$.pipe(
    map(names => names.size)
  );

  /** Retourne true si le nom du Pokémon est dans ma-collection.txt */
  isOwned(cardName: string): Observable<boolean> {
    return this.ownedNames$.pipe(
      map(names => names.has(cardName.toLowerCase()))
    );
  }
}
