// Copyright © 2024 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { UiNode, UiNodeDivisionAttributes } from "@ory/client"
import { isUiNodeTextAttributes } from "../../../ui"
import { Node } from "./node"

interface CaptchaSectionProps {
  nodes: UiNode[]
}

export function CaptchaSection({ nodes }: CaptchaSectionProps) {
  const filteredNodes = nodes.filter(
    (node) => (node.group as string) === "captcha",
  )
  return filteredNodes.map((node, k) => {
    if (isUiNodeTextAttributes(node.attributes)) {
      if (
        node.attributes.id === "captcha" ||
        node.attributes.text.id === 1070015
      ) {
        return <div id={node.attributes.id} key={node.attributes.id}></div>
      }
    } else if (node.attributes.node_type === "div") {
      const { id } = node.attributes as UiNodeDivisionAttributes
      return <div id={id} key={id}></div>
    }
    return <Node node={node} key={k} />
  })
}
