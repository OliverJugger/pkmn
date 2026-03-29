import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { TranslationService } from '../../core/services/translation.service';
import { Card } from '../../core/models/card.model';

const TYPE_ICONS: Record<string, string> = {
  Fire: '🔥', Water: '💧', Grass: '🌿', Electric: '⚡',
  Lightning: '⚡', Psychic: '🔮', Fighting: '👊', Darkness: '🌑',
  Metal: '⚙️', Dragon: '🐉', Fairy: '✨', Colorless: '⭐'
};

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    RouterLink,
    ButtonModule,
    TagModule,
    DividerModule,
    ChipModule,
    ProgressSpinnerModule
  ],
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss']
})
export class CardDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private apiService = inject(PokemonApiService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  card: Card | null = null;
  translatedName$: Observable<string> | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'ID de carte invalide.'; this.loading = false; return; }

    this.apiService.getCard(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.card = res.data;
          this.translatedName$ = this.translationService.translate(res.data.name);
          this.loading = false;
        },
        error: () => { this.error = 'Carte introuvable ou erreur réseau.'; this.loading = false; }
      });
  }

  getTypeIcon(type: string): string {
    return TYPE_ICONS[type] ?? '❓';
  }

  getMarketPrice(): number | null {
    const prices = this.card?.tcgplayer?.prices;
    if (!prices) return null;
    return prices.holofoil?.market
      ?? prices.normal?.market
      ?? prices.reverseHolofoil?.market
      ?? null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
