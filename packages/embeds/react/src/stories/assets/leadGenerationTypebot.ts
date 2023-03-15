import {
  BackgroundType,
  BubbleBlockType,
  ComparisonOperators,
  InputBlockType,
  LogicalOperator,
  LogicBlockType,
  StartTypebot,
} from '@typebot.io/schemas'

export const leadGenerationTypebot: StartTypebot = {
  id: 'clckrl4q5000t3b6sabwokaar',
  groups: [
    {
      id: 'clckrl4q5000g3b6skizhd262',
      title: 'Start',
      blocks: [
        {
          id: '22HP69iipkLjJDTUcc1AWW',
          type: 'start',
          label: 'Start',
          groupId: 'clckrl4q5000g3b6skizhd262',
          outgoingEdgeId: 'clckrlxp400173b6sktq7gqm2',
        },
      ],
      graphCoordinates: { x: 0, y: 0 },
    },
    {
      id: 'clckrl4q5000h3b6sjipn4qga',
      title: 'Welcome',
      blocks: [
        {
          id: 'sc1y8VwDabNJgiVTBi4qtif',
          type: BubbleBlockType.TEXT,
          content: {
            html: '<div>Welcome to <span class="slate-bold">AA</span> (Awesome Agency)</div>',
            richText: [
              {
                type: 'p',
                children: [
                  { text: 'Welcome to ' },
                  { bold: true, text: 'AA' },
                  { text: ' (Awesome Agency)' },
                ],
              },
            ],
            plainText: 'Welcome to AA (Awesome Agency)',
          },
          groupId: 'clckrl4q5000h3b6sjipn4qga',
        },
        {
          id: 's7YqZTBeyCa4Hp3wN2j922c',
          type: BubbleBlockType.IMAGE,
          content: {
            url: 'https://media2.giphy.com/media/XD9o33QG9BoMis7iM4/giphy.gif?cid=fe3852a3ihg8rvipzzky5lybmdyq38fhke2tkrnshwk52c7d&rid=giphy.gif&ct=g',
          },
          groupId: 'clckrl4q5000h3b6sjipn4qga',
        },
        {
          id: 'sbjZWLJGVkHAkDqS4JQeGow',
          type: InputBlockType.CHOICE,
          items: [
            {
              id: 'hQw2zbp7FDX7XYK9cFpbgC',
              type: 0,
              blockId: 'sbjZWLJGVkHAkDqS4JQeGow',
              content: 'Hi!',
            },
          ],
          groupId: 'clckrl4q5000h3b6sjipn4qga',
          options: { buttonLabel: 'Send', isMultipleChoice: false },
          outgoingEdgeId: 'clckrm7td001b3b6s2769fh7k',
        },
      ],
      graphCoordinates: { x: -8.26171875, y: 457.515625 },
    },
    {
      id: 'clckrl4q5000i3b6stgxyvscq',
      title: 'Email',
      blocks: [
        {
          id: 'sxeYubYN6XzhAfG7m9Fivhc',
          type: BubbleBlockType.TEXT,
          content: {
            html: '<div>Great! Nice to meet you {{Name}}</div>',
            richText: [
              {
                type: 'p',
                children: [{ text: 'Great! Nice to meet you {{Name}}' }],
              },
            ],
            plainText: 'Great! Nice to meet you {{Name}}',
          },
          groupId: 'clckrl4q5000i3b6stgxyvscq',
        },
        {
          id: 'scQ5kduafAtfP9T8SHUJnGi',
          type: BubbleBlockType.TEXT,
          content: {
            html: '<div>What&#x27;s the best email we can reach you at?</div>',
            richText: [
              {
                type: 'p',
                children: [
                  { text: "What's the best email we can reach you at?" },
                ],
              },
            ],
            plainText: "What's the best email we can reach you at?",
          },
          groupId: 'clckrl4q5000i3b6stgxyvscq',
        },
        {
          id: 'snbsad18Bgry8yZ8DZCfdFD',
          type: InputBlockType.EMAIL,
          groupId: 'clckrl4q5000i3b6stgxyvscq',
          options: {
            labels: { button: 'Send', placeholder: 'Type your email...' },
            variableId: 'v3VFChNVSCXQ2rXv4DrJ8Ah',
            retryMessageContent:
              "This email doesn't seem to be valid. Can you type it again?",
          },
          outgoingEdgeId: 'clckrl4q5000q3b6s5czdtm8x',
        },
      ],
      graphCoordinates: { x: 669, y: 141 },
    },
    {
      id: 'clckrl4q5000j3b6sloirnxza',
      title: 'Name',
      blocks: [
        {
          id: 'sgtE2Sy7cKykac9B223Kq9R',
          type: BubbleBlockType.TEXT,
          content: {
            html: '<div>What&#x27;s your name?</div>',
            richText: [
              { type: 'p', children: [{ text: "What's your name?" }] },
            ],
            plainText: "What's your name?",
          },
          groupId: 'clckrl4q5000j3b6sloirnxza',
        },
        {
          id: 'sqEsMo747LTDnY9FjQcEwUv',
          type: InputBlockType.TEXT,
          groupId: 'clckrl4q5000j3b6sloirnxza',
          options: {
            isLong: false,
            labels: {
              button: 'Send',
              placeholder: 'Type your answer...',
            },
            variableId: 'giiLFGw5xXBCHzvp1qAbdX',
          },
          outgoingEdgeId: 'clckrl4q5000p3b6shb5bfnzt',
        },
      ],
      graphCoordinates: { x: 340, y: 143 },
    },
    {
      id: 'clckrl4q5000k3b6s0anufmgy',
      title: 'Services',
      blocks: [
        {
          id: 'su7HceVXWyTCzi2vv3m4QbK',
          type: BubbleBlockType.TEXT,
          content: {
            html: '<div>What services are you interested in?</div>',
            richText: [
              {
                type: 'p',
                children: [{ text: 'What services are you interested in?' }],
              },
            ],
            plainText: 'What services are you interested in?',
          },
          groupId: 'clckrl4q5000k3b6s0anufmgy',
        },
        {
          id: 's5VQGsVF4hQgziQsXVdwPDW',
          type: InputBlockType.CHOICE,
          items: [
            {
              id: 'fnLCBF4NdraSwcubnBhk8H',
              type: 0,
              blockId: 's5VQGsVF4hQgziQsXVdwPDW',
              content: 'Website dev',
            },
            {
              id: 'a782h8ynMouY84QjH7XSnR',
              type: 0,
              blockId: 's5VQGsVF4hQgziQsXVdwPDW',
              content: 'Content Marketing',
            },
            {
              id: 'jGvh94zBByvVFpSS3w97zY',
              type: 0,
              blockId: 's5VQGsVF4hQgziQsXVdwPDW',
              content: 'Social Media',
            },
            {
              id: '6PRLbKUezuFmwWtLVbvAQ7',
              type: 0,
              blockId: 's5VQGsVF4hQgziQsXVdwPDW',
              content: 'UI / UX Design',
            },
          ],
          groupId: 'clckrl4q5000k3b6s0anufmgy',
          options: { buttonLabel: 'Send', isMultipleChoice: true },
          outgoingEdgeId: 'clckrl4q5000r3b6s9yxsuxu7',
        },
      ],
      graphCoordinates: { x: 1002, y: 144 },
    },
    {
      id: 'clckrl4q5000l3b6scn1r1nns',
      title: 'Additional information',
      blocks: [
        {
          id: 'sqR8Sz9gW21aUYKtUikq7qZ',
          type: BubbleBlockType.TEXT,
          content: {
            html: '<div>Can you tell me a bit more about your needs?</div>',
            richText: [
              {
                type: 'p',
                children: [
                  { text: 'Can you tell me a bit more about your needs?' },
                ],
              },
            ],
            plainText: 'Can you tell me a bit more about your needs?',
          },
          groupId: 'clckrl4q5000l3b6scn1r1nns',
        },
        {
          id: 'sqFy2G3C1mh9p6s3QBdSS5x',
          type: InputBlockType.TEXT,
          groupId: 'clckrl4q5000l3b6scn1r1nns',
          options: {
            isLong: true,
            labels: { button: 'Send', placeholder: 'Type your answer...' },
          },
          outgoingEdgeId: 'clckrl4q5000s3b6stx5nnqbz',
        },
      ],
      graphCoordinates: { x: 1337, y: 145 },
    },
    {
      id: 'clckrl4q5000m3b6srabr5a2s',
      title: 'Bye',
      blocks: [
        {
          id: 'seLegenCgUwMopRFeAefqZ7',
          type: BubbleBlockType.TEXT,
          content: {
            html: '<div>Perfect!</div>',
            richText: [{ type: 'p', children: [{ text: 'Perfect!' }] }],
            plainText: 'Perfect!',
          },
          groupId: 'clckrl4q5000m3b6srabr5a2s',
        },
        {
          id: 's779Q1y51aVaDUJVrFb16vv',
          type: BubbleBlockType.TEXT,
          content: {
            html: '<div>We&#x27;ll get back to you at {{Email}}</div>',
            richText: [
              {
                type: 'p',
                children: [{ text: "We'll get back to you at {{Email}}" }],
              },
            ],
            plainText: "We'll get back to you at {{Email}}",
          },
          groupId: 'clckrl4q5000m3b6srabr5a2s',
        },
      ],
      graphCoordinates: { x: 1668, y: 143 },
    },
    {
      id: 'clckrlksq000z3b6sequnj9m3',
      graphCoordinates: { x: -355.04296875, y: 187.5078125 },
      title: 'Group #7',
      blocks: [
        {
          id: 'clckrlksq00103b6s3exi90al',
          groupId: 'clckrlksq000z3b6sequnj9m3',
          type: LogicBlockType.CONDITION,
          items: [
            {
              id: 'clckrlksq00113b6sz8naxdwx',
              blockId: 'clckrlksq00103b6s3exi90al',
              type: 1,
              content: {
                comparisons: [
                  {
                    id: 'clckrllsm00123b6sz38325aw',
                    variableId: 'giiLFGw5xXBCHzvp1qAbdX',
                    comparisonOperator: ComparisonOperators.IS_SET,
                  },
                ],
                logicalOperator: LogicalOperator.AND,
              },
              outgoingEdgeId: 'clckrlt0000143b6sn9euzwnm',
            },
          ],
          outgoingEdgeId: 'clckrluh600153b6s66p2q6wa',
        },
      ],
    },
    {
      id: 'clckrm1zq00183b6sz8ydapth',
      graphCoordinates: { x: 333.8046875, y: 408.1328125 },
      title: 'Group #7 copy',
      blocks: [
        {
          id: 'clckrm1zr00193b6szpz37plc',
          groupId: 'clckrm1zq00183b6sz8ydapth',
          type: LogicBlockType.CONDITION,
          items: [
            {
              id: 'clckrm1zr001a3b6s1hlfm2jh',
              blockId: 'clckrm1zr00193b6szpz37plc',
              type: 1,
              content: {
                comparisons: [
                  {
                    id: 'clckrllsm00123b6sz38325aw',
                    variableId: 'giiLFGw5xXBCHzvp1qAbdX',
                    comparisonOperator: ComparisonOperators.IS_SET,
                  },
                ],
                logicalOperator: LogicalOperator.AND,
              },
              outgoingEdgeId: 'clckrma26001c3b6sup2bdbte',
            },
          ],
          outgoingEdgeId: 'clckrmbbk001d3b6shr35s2ao',
        },
      ],
    },
    {
      id: 'clckrlqil00133b6sk6msgqt1',
      graphCoordinates: { x: -23.78515625, y: 199.6875 },
      title: 'Group #8',
      blocks: [
        {
          id: 'clckrl870000y3b6sxyd24qwc',
          groupId: 'clckrlqil00133b6sk6msgqt1',
          type: BubbleBlockType.TEXT,
          content: {
            html: '<div>Hi {{Name}}!</div>',
            richText: [{ type: 'p', children: [{ text: 'Hi {{Name}}!' }] }],
            plainText: 'Hi {{Name}}!',
          },
          outgoingEdgeId: 'clckrlwmd00163b6sjlass4p8',
        },
      ],
    },
  ],
  variables: [
    { id: 'giiLFGw5xXBCHzvp1qAbdX', name: 'Name' },
    { id: 'v3VFChNVSCXQ2rXv4DrJ8Ah', name: 'Email' },
  ],
  edges: [
    {
      id: 'clckrl4q5000p3b6shb5bfnzt',
      to: { groupId: 'clckrl4q5000i3b6stgxyvscq' },
      from: {
        blockId: 'sqEsMo747LTDnY9FjQcEwUv',
        groupId: 'clckrl4q5000j3b6sloirnxza',
      },
    },
    {
      id: 'clckrl4q5000q3b6s5czdtm8x',
      to: { groupId: 'clckrl4q5000k3b6s0anufmgy' },
      from: {
        blockId: 'snbsad18Bgry8yZ8DZCfdFD',
        groupId: 'clckrl4q5000i3b6stgxyvscq',
      },
    },
    {
      id: 'clckrl4q5000r3b6s9yxsuxu7',
      to: { groupId: 'clckrl4q5000l3b6scn1r1nns' },
      from: {
        blockId: 's5VQGsVF4hQgziQsXVdwPDW',
        groupId: 'clckrl4q5000k3b6s0anufmgy',
      },
    },
    {
      id: 'clckrl4q5000s3b6stx5nnqbz',
      to: { groupId: 'clckrl4q5000m3b6srabr5a2s' },
      from: {
        blockId: 'sqFy2G3C1mh9p6s3QBdSS5x',
        groupId: 'clckrl4q5000l3b6scn1r1nns',
      },
    },
    {
      from: {
        groupId: 'clckrlksq000z3b6sequnj9m3',
        blockId: 'clckrlksq00103b6s3exi90al',
        itemId: 'clckrlksq00113b6sz8naxdwx',
      },
      to: { groupId: 'clckrlqil00133b6sk6msgqt1' },
      id: 'clckrlt0000143b6sn9euzwnm',
    },
    {
      from: {
        groupId: 'clckrlksq000z3b6sequnj9m3',
        blockId: 'clckrlksq00103b6s3exi90al',
      },
      to: { groupId: 'clckrl4q5000h3b6sjipn4qga' },
      id: 'clckrluh600153b6s66p2q6wa',
    },
    {
      from: {
        groupId: 'clckrlqil00133b6sk6msgqt1',
        blockId: 'clckrl870000y3b6sxyd24qwc',
      },
      to: { groupId: 'clckrl4q5000h3b6sjipn4qga' },
      id: 'clckrlwmd00163b6sjlass4p8',
    },
    {
      from: {
        groupId: 'clckrl4q5000g3b6skizhd262',
        blockId: '22HP69iipkLjJDTUcc1AWW',
      },
      to: { groupId: 'clckrlksq000z3b6sequnj9m3' },
      id: 'clckrlxp400173b6sktq7gqm2',
    },
    {
      from: {
        groupId: 'clckrl4q5000h3b6sjipn4qga',
        blockId: 'sbjZWLJGVkHAkDqS4JQeGow',
      },
      to: { groupId: 'clckrm1zq00183b6sz8ydapth' },
      id: 'clckrm7td001b3b6s2769fh7k',
    },
    {
      from: {
        groupId: 'clckrm1zq00183b6sz8ydapth',
        blockId: 'clckrm1zr00193b6szpz37plc',
        itemId: 'clckrm1zr001a3b6s1hlfm2jh',
      },
      to: { groupId: 'clckrl4q5000i3b6stgxyvscq' },
      id: 'clckrma26001c3b6sup2bdbte',
    },
    {
      from: {
        groupId: 'clckrm1zq00183b6sz8ydapth',
        blockId: 'clckrm1zr00193b6szpz37plc',
      },
      to: { groupId: 'clckrl4q5000j3b6sloirnxza' },
      id: 'clckrmbbk001d3b6shr35s2ao',
    },
  ],
  theme: {
    chat: {
      inputs: {
        color: '#303235',
        backgroundColor: '#FFFFFF',
        placeholderColor: '#9095A0',
      },
      buttons: { color: '#FFFFFF', backgroundColor: '#0042DA' },
      hostAvatar: {
        url: 'https://avatars.githubusercontent.com/u/16015833?v=4',
        isEnabled: true,
      },
      hostBubbles: { color: '#303235', backgroundColor: '#F7F8FF' },
      guestBubbles: { color: '#FFFFFF', backgroundColor: '#FF8E21' },
    },
    general: {
      font: 'Open Sans',
      background: { type: BackgroundType.COLOR, content: '#fff' },
    },
  },
  settings: {
    general: { isBrandingEnabled: true },
    metadata: {
      description:
        'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.',
    },
    typingEmulation: { speed: 300, enabled: true, maxDelay: 1.5 },
  },
}
