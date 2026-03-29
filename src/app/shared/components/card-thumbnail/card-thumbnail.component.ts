import { Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Card } from '../../../core/models/card.model';
import { PersonalCollectionService } from '../../../core/services/personal-collection.service';

@Component({
  selector: 'app-card-thumbnail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, TagModule, TooltipModule],
  templateUrl: './card-thumbnail.component.html',
  styleUrls: ['./card-thumbnail.component.scss']
})
export class CardThumbnailComponent implements OnInit {
  @Input({ required: true }) card!: Card;

  private personalCollectionService = inject(PersonalCollectionService);

  isOwned$!: Observable<boolean>;

  ngOnInit(): void {
    this.isOwned$ = this.personalCollectionService.isOwned(this.card.name);
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
