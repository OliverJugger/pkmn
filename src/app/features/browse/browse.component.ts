import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { AsyncPipe } from '@angular/common';
import { CardThumbnailComponent } from '../../shared/components/card-thumbnail/card-thumbnail.component';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { PersonalCollectionService } from '../../core/services/personal-collection.service';
import { Card } from '../../core/models/card.model';
import { PokemonSet } from '../../core/models/set.model';

interface PaginatorState {
  page?: number;
  rows?: number;
  first?: number;
}

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    ProgressSpinnerModule,
    MessageModule,
    CardThumbnailComponent
  ],
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit, OnDestroy {
  private apiService = inject(PokemonApiService);
  private personalCollectionService = inject(PersonalCollectionService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  ownedCount$ = this.personalCollectionService.ownedCount$;

  cards: Card[] = [];
  sets: PokemonSet[] = [];
  selectedSet: PokemonSet | null = null;
  searchQuery = '';

  loading = false;
  loadingSets = true;
  error = '';

  totalCount = 0;
  pageSize = 20;
  currentPage = 1;

  ngOnInit(): void {
    this.loadSets();
    this.loadCards();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadCards();
    });
  }

  loadSets(): void {
    this.apiService.getSets({ orderBy: '-releaseDate' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.sets = res.data;
          this.loadingSets = false;
        },
        error: () => { this.loadingSets = false; }
      });
  }

  loadCards(): void {
    this.loading = true;
    this.error = '';

    // Filtres permanents — uniquement les Pokémon Illustration Rare (hors Special)
    let query = 'rarity:"Illustration Rare" -rarity:"Special Illustration Rare" supertype:Pokémon';
    if (this.searchQuery.trim()) {
      query += ` name:${this.searchQuery.trim()}*`;
    }
    if (this.selectedSet) {
      query += ` set.id:${this.selectedSet.id}`;
    }

    this.apiService.getCards({
      q: query || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      orderBy: 'number'
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.cards = res.data;
        this.totalCount = res.totalCount;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des cartes. Vérifiez votre clé API dans environment.ts.';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onSetChange(): void {
    this.currentPage = 1;
    this.loadCards();
  }

  onSetClear(): void {
    this.selectedSet = null;
    this.currentPage = 1;
    this.loadCards();
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage = (event.page ?? 0) + 1;
    this.pageSize = event.rows ?? 20;
    this.loadCards();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
