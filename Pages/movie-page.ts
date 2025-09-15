import { expect } from "playwright/test";

// Page object for the Home Page
export class MoviePage {
    readonly movieTitle;
    readonly movieDescription;
    readonly allActors
    readonly movieRating;

    constructor(private page: any) {
        this.movieTitle = this.page.getByTestId('hero__primary-text');
        this.movieDescription = this.page.getByTestId('plot-xl');
        this.allActors = this.page.locator('ul.ipc-inline-list a.ipc-metadata-list-item__list-content-item');
        this.movieRating = this.page.locator('span.sc-4dc495c1-1.lbQcRY')
    }

    async getMovieTitle() {
        return await this.movieTitle.textContent();
    }

    async getMovieDescription() {
        return await this.movieDescription.textContent();
    }

    async getStarsText() {
        return await this.allActors.allInnerTexts();
    }

    async getMovieRating(){
       return await this.movieRating.textContent();
    }
}
