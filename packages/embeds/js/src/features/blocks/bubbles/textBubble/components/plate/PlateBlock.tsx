import type { TElement, TText, TDescendant } from '@udecode/plate-common'
import { PlateText, PlateTextProps } from './PlateText'
import { For, Match, Switch, JSXElement } from 'solid-js'
import { isDefined } from '@typebot.io/lib/utils'
import clsx from 'clsx'

type Props = {
  element: TElement | TText
  isUniqueChild?: boolean
  inElement?: boolean
}

export const PlateElement = (props: Props) => (
  <Switch>
    <Match when={isDefined(props.element.text)}>
      <PlateText
        {...(props.element as PlateTextProps)}
        isUniqueChild={props.isUniqueChild ?? false}
      />
    </Match>
    <Match when={props.element.type}>
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
                  inElement={true}
                />
              )}
            </For>
          </a>
        </Match>
        <Match when={props.element.type !== 'a'}>
          <ElementRoot
            element={props.element as TElement}
            inElement={props.inElement ?? false}
          >
            <For each={props.element.children as TDescendant[]}>
              {(child) => (
                <PlateElement
                  element={child}
                  isUniqueChild={
                    (props.element.children as TDescendant[])?.length === 1
                  }
                  inElement={true}
                />
              )}
            </For>
          </ElementRoot>
        </Match>
      </Switch>
    </Match>
  </Switch>
)

type ElementRootProps = {
  element: TElement
  inElement: boolean
  children: JSXElement
}

const ElementRoot = (props: ElementRootProps) => {
  return (
    <Switch>
      <Match when={props.inElement}>
        <span data-element-type={props.element.type}>{props.children}</span>
      </Match>
      <Match when={!props.inElement}>
        <div
          data-element-type={props.element.type}
          class={clsx(
            props.element.type === 'variable' && 'flex flex-col gap-6'
          )}
        >
          {props.children}
        </div>
      </Match>
    </Switch>
  )
}
