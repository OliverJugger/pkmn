import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { CollectionService } from '../../core/services/collection.service';
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
    CurrencyPipe,
    RouterLink,
    ButtonModule,
    TagModule,
    DividerModule,
    ChipModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss']
})
export class CardDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private apiService = inject(PokemonApiService);
  private collectionService = inject(CollectionService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  card: Card | null = null;
  loading = true;
  error = '';
  quantity = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'ID de carte invalide.'; this.loading = false; return; }

    this.apiService.getCard(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.card = res.data;
          this.loading = false;
          this.collectionService.getQuantity(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(q => this.quantity = q);
        },
        error: () => {
          this.error = 'Carte introuvable ou erreur réseau.';
          this.loading = false;
        }
      });
  }

  addToCollection(): void {
    if (!this.card) return;
    this.collectionService.addCard(this.card);
    this.messageService.add({
      severity: 'success',
      summary: 'Ajoutée !',
      detail: `${this.card.name} ajoutée à votre collection.`,
      life: 2000
    });
  }

  removeFromCollection(): void {
    if (!this.card) return;
    this.collectionService.removeCard(this.card.id);
    this.messageService.add({
      severity: 'info',
      summary: 'Retirée',
      detail: `${this.card.name} — une copie retirée.`,
      life: 2000
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
