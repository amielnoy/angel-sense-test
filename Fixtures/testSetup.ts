import {test as base} from '@playwright/test'
import {HomePage} from "../Pages/home-page";
import {MoviePage} from "../Pages/movie-page";

interface ITestFixtures {
  homePage: HomePage;
  moviePage: MoviePage;
}

const test = base.extend<ITestFixtures>({

  homePage: async ({page}, use) => {
    const homePage = new HomePage(page)
    await use(homePage)
  },
  moviePage: async ({page}, use) => {
        const moviePage = new MoviePage(page)
        await use(moviePage)
    },
})

export default test
