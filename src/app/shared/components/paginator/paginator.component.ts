import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

type PageItem = number | '...';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalCount = 0;
  @Input() pageSize = 20;
  @Output() pageChange = new EventEmitter<number>();

  pages: PageItem[] = [];
  totalPages = 0;

  ngOnChanges(): void {
    this.buildPages();
  }

  buildPages(): void {
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);

    if (this.totalPages <= 1) {
      this.pages = [];
      return;
    }

    const current = this.currentPage;
    const total = this.totalPages;

    // Collecte les numéros à afficher (sans doublons)
    const pageSet = new Set<number>();

    // 2 premières pages
    pageSet.add(1);
    if (total >= 2) pageSet.add(2);

    // Fenêtre autour de la page courante
    if (current - 1 > 0) pageSet.add(current - 1);
    pageSet.add(current);
    if (current + 1 <= total) pageSet.add(current + 1);

    // 2 dernières pages
    if (total - 1 >= 1) pageSet.add(total - 1);
    pageSet.add(total);

    // Tri + insertion des "..."
    const sorted = Array.from(pageSet).sort((a, b) => a - b);
    const result: PageItem[] = [];

    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push('...');
      }
      result.push(sorted[i]);
    }

    this.pages = result;
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  isEllipsis(item: PageItem): item is '...' {
    return item === '...';
  }
}
