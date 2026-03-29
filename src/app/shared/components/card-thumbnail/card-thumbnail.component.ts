import { Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Card } from '../../../core/models/card.model';
import { CollectionService } from '../../../core/services/collection.service';
import { PersonalCollectionService } from '../../../core/services/personal-collection.service';

@Component({
  selector: 'app-card-thumbnail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, ButtonModule, TagModule, TooltipModule],
  templateUrl: './card-thumbnail.component.html',
  styleUrls: ['./card-thumbnail.component.scss']
})
export class CardThumbnailComponent implements OnInit {
  @Input({ required: true }) card!: Card;

  private collectionService = inject(CollectionService);
  private personalCollectionService = inject(PersonalCollectionService);

  isInCollection$!: Observable<boolean>;
  quantity$!: Observable<number>;
  isOwned$!: Observable<boolean>;

  ngOnInit(): void {
    this.isInCollection$ = this.collectionService.isInCollection(this.card.id);
    this.quantity$ = this.collectionService.getQuantity(this.card.id);
    this.isOwned$ = this.personalCollectionService.isOwned(this.card.name);
  }

  onAdd(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.collectionService.addCard(this.card);
  }

  onRemove(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.collectionService.removeCard(this.card.id);
  }

  getRarityColor(rarity?: string): 'secondary' | 'info' | 'warn' | 'danger' {
    const rarityMap: Record<string, 'secondary' | 'info' | 'warn' | 'danger'> = {
      'Common': 'secondary',
      'Uncommon': 'info',
      'Rare': 'warn',
      'Rare Holo': 'warn',
      'Rare Ultra': 'danger',
      'Rare Secret': 'danger',
      'Rare Rainbow': 'danger',
      'Amazing Rare': 'danger',
      'LEGEND': 'danger',
    };
    return rarityMap[rarity ?? ''] ?? 'secondary';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.opacity = '0.3';
  }
}
