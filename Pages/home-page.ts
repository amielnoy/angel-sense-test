import { expect } from "playwright/test";

// Page object for the Home Page
export class HomePage {
    readonly searchInput;
    readonly firstMovieResult;

    constructor(private page: any) {
        this.searchInput = this.page.getByRole('textbox', { name: 'Search IMDb' });
        this.firstMovieResult = this.page.locator('[role="option"]').first();
    }

    async navigateToImdbPage() {
        await this.page.goto('http://www.imdb.com');
    }

    async searchForMovie(movieName: string) {
        await this.searchInput.fill(movieName)
    }

    async clickFirstMovieResult() {
        await this.firstMovieResult.click();
    }
}
