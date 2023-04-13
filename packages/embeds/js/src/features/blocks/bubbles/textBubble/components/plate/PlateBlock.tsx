import type { TElement, TText, TDescendant } from '@udecode/plate-common'
import { PlateText, PlateTextProps } from './PlateText'
import { For, Match, Show, Switch } from 'solid-js'

type Props = { element: TElement | TText }

export const PlateBlock = (props: Props) => (
  <Show
    when={!props.element.text}
    fallback={<PlateText {...(props.element as PlateTextProps)} />}
  >
    <Switch
      fallback={
        <div>
          <For each={props.element.children as TDescendant[]}>
            {(child) => <PlateBlock element={child} />}
          </For>
        </div>
      }
    >
      <Match when={props.element.type === 'a'}>
        <a href={props.element.url as string} target="_blank" class="slate-a">
          <For each={props.element.children as TDescendant[]}>
            {(child) => <PlateBlock element={child} />}
          </For>
        </a>
      </Match>
    </Switch>
  </Show>
)
