import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Card } from '../models/card.model';

export interface CollectionItem {
  card: Card;
  quantity: number;
  addedAt: Date;
}

const COLLECTION_STORAGE_KEY = 'pkmn_collection_v1';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private collectionSubject: BehaviorSubject<CollectionItem[]>;

  collection$: Observable<CollectionItem[]>;
  count$: Observable<number>;

  constructor() {
    const stored = this.loadFromStorage();
    this.collectionSubject = new BehaviorSubject<CollectionItem[]>(stored);
    this.collection$ = this.collectionSubject.asObservable();
    this.count$ = this.collection$.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  addCard(card: Card): void {
    const current = this.collectionSubject.getValue();
    const existing = current.find(item => item.card.id === card.id);

    let updated: CollectionItem[];
    if (existing) {
      updated = current.map(item =>
        item.card.id === card.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updated = [...current, { card, quantity: 1, addedAt: new Date() }];
    }

    this.collectionSubject.next(updated);
    this.saveToStorage(updated);
  }

  removeCard(cardId: string): void {
    const current = this.collectionSubject.getValue();
    const existing = current.find(item => item.card.id === cardId);
    if (!existing) return;

    let updated: CollectionItem[];
    if (existing.quantity > 1) {
      updated = current.map(item =>
        item.card.id === cardId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    } else {
      updated = current.filter(item => item.card.id !== cardId);
    }

    this.collectionSubject.next(updated);
    this.saveToStorage(updated);
  }

  removeAll(cardId: string): void {
    const updated = this.collectionSubject.getValue().filter(item => item.card.id !== cardId);
    this.collectionSubject.next(updated);
    this.saveToStorage(updated);
  }

  isInCollection(cardId: string): Observable<boolean> {
    return this.collection$.pipe(
      map(items => items.some(item => item.card.id === cardId))
    );
  }

  getQuantity(cardId: string): Observable<number> {
    return this.collection$.pipe(
      map(items => {
        const item = items.find(i => i.card.id === cardId);
        return item ? item.quantity : 0;
      })
    );
  }

  private loadFromStorage(): CollectionItem[] {
    try {
      const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed.map((item: CollectionItem & { addedAt: string }) => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }));
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CollectionItem[]): void {
    try {
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Impossible de sauvegarder la collection.', e);
    }
  }
}
