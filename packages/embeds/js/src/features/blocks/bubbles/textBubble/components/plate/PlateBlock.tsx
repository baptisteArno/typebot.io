import type { TElement, TText, TDescendant } from '@udecode/plate-common'
import { PlateText, PlateTextProps } from './PlateText'
import { For, Match, Switch } from 'solid-js'
import { isDefined } from '@typebot.io/lib/utils'

type Props = {
  element: TElement | TText
  isUniqueChild?: boolean
}

export const PlateElement = (props: Props) => (
  <Switch>
    <Match when={isDefined(props.element.text)}>
      <PlateText
        {...(props.element as PlateTextProps)}
        isUniqueChild={props.isUniqueChild ?? false}
      />
    </Match>
    <Match when={true}>
      <Switch>
        <Match when={props.element.type === 'a'}>
          <a
            href={props.element.url as string}
            target="_blank"
            rel="noopener noreferrer"
          >
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                />
              )}
            </For>
          </a>
        </Match>
        <Match when={props.element.type === 'ol'}>
          <ol>
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                />
              )}
            </For>
          </ol>
        </Match>
        <Match when={props.element.type === 'ul'}>
          <ul>
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                />
              )}
            </For>
          </ul>
        </Match>
        <Match when={props.element.type === 'li'}>
          <li>
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                />
              )}
            </For>
          </li>
        </Match>
        <Match when={true}>
          <div data-element-type={props.element.type}>
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                />
              )}
            </For>
          </div>
        </Match>
      </Switch>
    </Match>
  </Switch>
)
