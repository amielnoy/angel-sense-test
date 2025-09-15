import test from '../Fixtures/testSetup'
import {expect} from "@playwright/test";

  test('test Imdb', async ({
    homePage,
    moviePage,
  }) => {
    let movieToSearch='Godfather'
    await homePage.navigateToImdbPage()
    await homePage.searchForMovie(movieToSearch)
    await homePage.clickFirstMovieResult()
    const movieTitle=await moviePage.getMovieTitle()
    const movieDescription=await moviePage.getMovieDescription()
    console.log(`movieTitle=${movieTitle}\nmovieDescription=${movieDescription}`)
    const starNameToTest='Marlon Brando'
    const arrayOfStars=await moviePage.getStarsText()
    expect(arrayOfStars).toContain(starNameToTest)
    const ratingText = await moviePage.movieRating.first().innerText()
    const numericalRating = parseFloat(ratingText)
    expect(numericalRating).toBeGreaterThan(8.0)
})
