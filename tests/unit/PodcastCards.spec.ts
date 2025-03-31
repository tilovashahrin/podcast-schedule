import { describe, it, expect, beforeEach, vi } from "vitest";
import { PodcastCards } from "../../src/composables/PodcastCards";
import axios from "axios";

//mock axios so we don't make real api calls
vi.mock("axios");

describe("PodcastCards composable", () => {
  let podcast: ReturnType<typeof PodcastCards>;

  //set up a fresh instance before each test
  beforeEach(() => {
    podcast = PodcastCards();
  });

  //check if the composable initializes properly
  it("should initialize with empty search query and podcasts", () => {
    expect(podcast.searchQuery.value).toBe("");
    expect(podcast.podcasts.value).toEqual([]);
  });

  it("should fetch podcasts based on search query", async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        shows: { items: [{ id: "1", name: "Rotten Mango", images: [{ url: "image.jpg" }] }] },
      },
    });

    //simulate user typing "rotten" in the search bar
    const mockEvent = { target: { value: "rotten" } } as unknown as Event;
    podcast.updateSearch(mockEvent);

    //wait for the api call to resolve
    await new Promise((r) => setTimeout(r, 0));

    expect(podcast.searchQuery.value).toBe("rotten");
    expect(podcast.podcasts.value.length).toBe(1);
    expect(podcast.podcasts.value[0].name).toBe("Rotten Mango");
  });

  it("should select and deselect a podcast", () => {
    podcast.podcasts.value = [{ id: "1", name: "Rotten Mango", images: [{ url: "image.jpg" }] }];
    
    //select the podcast
    podcast.toggleSelection("1");
    expect(podcast.selectedPodcasts.value.length).toBe(1);
    expect(podcast.selectedPodcasts.value[0].id).toBe("1");

    //deselect the podcast
    podcast.toggleSelection("1");
    expect(podcast.selectedPodcasts.value.length).toBe(0);
  });
});
