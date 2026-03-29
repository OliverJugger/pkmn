import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { CollectionService, CollectionItem } from '../../core/services/collection.service';
import { CardThumbnailComponent } from '../../shared/components/card-thumbnail/card-thumbnail.component';

type SortOption = { label: string; value: string };

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule,
    TooltipModule,
    CardThumbnailComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnDestroy {
  private collectionService = inject(CollectionService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  private searchQuery$ = new BehaviorSubject<string>('');
  private sortBy$ = new BehaviorSubject<string>('recent');

  collection$ = this.collectionService.collection$;
  count$ = this.collectionService.count$;

  sortOptions: SortOption[] = [
    { label: 'Ajout récent', value: 'recent' },
    { label: 'Nom A→Z', value: 'nameAsc' },
    { label: 'Nom Z→A', value: 'nameDesc' },
    { label: 'Quantité ↓', value: 'qtyDesc' },
  ];
  selectedSort: SortOption = this.sortOptions[0];

  filteredCollection$ = combineLatest([
    this.collection$,
    this.searchQuery$,
    this.sortBy$
  ]).pipe(
    map(([items, query, sort]) => {
      let result = query
        ? items.filter(item => item.card.name.toLowerCase().includes(query.toLowerCase()))
        : [...items];

      switch (sort) {
        case 'nameAsc': result.sort((a, b) => a.card.name.localeCompare(b.card.name)); break;
        case 'nameDesc': result.sort((a, b) => b.card.name.localeCompare(a.card.name)); break;
        case 'qtyDesc': result.sort((a, b) => b.quantity - a.quantity); break;
        default: result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      }
      return result;
    })
  );

  onSearchChange(value: string): void {
    this.searchQuery$.next(value);
  }

  onSortChange(): void {
    this.sortBy$.next(this.selectedSort.value);
  }

  removeAll(item: CollectionItem, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Retirer toutes les copies de "${item.card.name}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-trash',
      acceptLabel: 'Oui, retirer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.collectionService.removeAll(item.card.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Retirée',
          detail: `${item.card.name} retirée de la collection.`,
          life: 2000
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
