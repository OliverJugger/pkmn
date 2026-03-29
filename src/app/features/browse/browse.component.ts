import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { AsyncPipe } from '@angular/common';
import { CardThumbnailComponent } from '../../shared/components/card-thumbnail/card-thumbnail.component';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { PersonalCollectionService } from '../../core/services/personal-collection.service';
import { Card } from '../../core/models/card.model';
import { PokemonSet } from '../../core/models/set.model';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    InputTextModule,
    SelectModule,
    ProgressSpinnerModule,
    MessageModule,
    CardThumbnailComponent,
    PaginatorComponent
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
  first = 0; // index du premier élément — piloté par le Paginator

  ngOnInit(): void {
    this.loadSets();
    this.loadCards();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.first = 0;
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
    this.first = 0;
    this.loadCards();
  }

  onSetClear(): void {
    this.selectedSet = null;
    this.currentPage = 1;
    this.first = 0;
    this.loadCards();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.first = (page - 1) * this.pageSize;
    this.loadCards();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
