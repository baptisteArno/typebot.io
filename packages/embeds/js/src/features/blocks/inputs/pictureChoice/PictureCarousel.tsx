import { For, createSignal } from 'solid-js'
import { PictureChoiceBlock } from '@typebot.io/schemas'
import { Carousel } from '@ark-ui/solid'
import { isSvgSrc } from '@typebot.io/lib'

type Props = {
  items: PictureChoiceBlock['items']
  handleClick: (itemIndex: number) => void
  //onClick: (index: number) => void
  onImageLoad: () => void
}

export const PictureCarousel = (props: Props) => {
  const [currentIndex, setCurrentIndex] = createSignal(0)

  return (
    <>
      <Carousel.Root
        align="center"
        loop={true}
        slidesPerView={1}
        //spacing="16px"
        orientation="horizontal"
        index={currentIndex()}
        onIndexChange={(details) => setCurrentIndex(details.index)}
        class="position: relative; width: 100%; max-width: 600px; margin: auto; justify-center"
      >
        <Carousel.Viewport class="justify-center overflow-hidden rounded-md">
          <Carousel.ItemGroup>
            <For each={props.items}>
              {(item, index) => (
                <Carousel.Item index={index()}>
                  <div class="px-4 py-5 sm:p-6">
                    <button
                      on:click={() => props.handleClick(index())}
                      data-itemid={item.id}
                      class={
                        'flex flex-col typebot-picture-button focus:outline-none filter hover:brightness-90 active:brightness-75 ' +
                        (isSvgSrc(item.pictureSrc) ? 'has-svg' : '')
                      }
                    >
                      <img
                        src={item.pictureSrc}
                        alt={item.title ?? `Picture ${index() + 1}`}
                        elementtiming={`Picture choice ${index() + 1}`}
                        fetchpriority={'high'}
                        class="m-auto w-full aspect-square"
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
                  </div>
                </Carousel.Item>
              )}
            </For>
          </Carousel.ItemGroup>
        </Carousel.Viewport>
        {/*}
        <Carousel.Control class="gap-2 flex justify-center">
          <Carousel.PrevTrigger class="py-2 px-4 font-semibold focus:outline-none filter hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 flex justify-center">
            &#8676; Previous
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger class="py-2 px-4 font-semibold focus:outline-none filter hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 flex justify-center">
            Next &#8677;
          </Carousel.NextTrigger>
        </Carousel.Control>
        */}
        <Carousel.Control class="isolate inline-flex rounded-md shadow-sm justify-center">
          <Carousel.PrevTrigger class="relative inline-flex items-center px-2 py-2 ring-1 ring-inset ring-gray-300 focus:z-10 typebot-button">
            &#8676; Previous
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger class="relative -ml-px inline-flex items-center  px-2 py-2  ring-1 ring-inset ring-gray-300 focus:z-10 typebot-button">
            Next &#8677;
          </Carousel.NextTrigger>
        </Carousel.Control>
      </Carousel.Root>
    </>
  )
}
