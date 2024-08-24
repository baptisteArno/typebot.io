import { For, createSignal } from 'solid-js'
import { PictureChoiceBlock } from '@typebot.io/schemas'
import { Carousel } from '@ark-ui/solid'

type Props = {
  items: PictureChoiceBlock['items']
  handleClick: (itemIndex: number) => void
  onImageLoad: () => void
}

export const PictureCarousel = (props: Props) => {
  const [currentIndex, setCurrentIndex] = createSignal(0)

  return (
    <>
      <Carousel.Root
        align="center"
        loop={true}
        orientation="horizontal"
        index={currentIndex()}
        onIndexChange={(details) => setCurrentIndex(details.index)}
        class="relative w-full max-w-[300px] mx-auto"
      >
        <Carousel.Viewport class="overflow-hidden">
          <Carousel.ItemGroup class="flex">
            <For each={props.items}>
              {(item, index) => (
                <Carousel.Item index={index()} class="flex-shrink-0 w-full">
                  <button
                    on:click={() => props.handleClick(index())}
                    data-itemid={item.id}
                    class="w-full bg-white rounded-lg overflow-hidden focus:outline-none hover:shadow-lg transition-shadow duration-300 typebot-carousel-button"
                  >
                    <img
                      src={item.pictureSrc}
                      alt={item.title ?? `Picture ${index() + 1}`}
                      elementtiming={`Picture choice ${index() + 1}`}
                      fetchpriority={'high'}
                      class="w-full h-[200px] object-cover"
                      onLoad={props.onImageLoad}
                    />
                    <div
                      class={
                        'flex flex-col gap-1 py-2 flex-shrink-0 px-4 w-full' +
                        (item.description ? ' items-start' : '')
                      }
                    >
                      <span class="font-semibold">{item.title}</span>
                      <span class="text-sm whitespace-pre-wrap text-left">
                        {item.description}
                      </span>
                    </div>
                  </button>
                </Carousel.Item>
              )}
            </For>
          </Carousel.ItemGroup>
        </Carousel.Viewport>
        <div class="absolute inset-0 flex justify-between items-center pointer-events-none">
          <Carousel.PrevTrigger class="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 ml-2 pointer-events-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger class="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 mr-2 pointer-events-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Carousel.NextTrigger>
        </div>
      </Carousel.Root>
    </>
  )
}
