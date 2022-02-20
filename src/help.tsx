import {
  CommandHandler,
  useDescription,
  createElement,
  Message,
  useButton,
  Row,
  Button,
  useSelectMenu,
  Select,
  Option,
  MessageResponse,
} from "slshx";

interface Topic {
  title: string;
  subtitle?: string;
  position?: number;
  content: string;
  links?: { name: string; url: string }[];

  id: string;
  categoryId?: string;
}

//@ts-ignore
import untypedTopics from "../topics";

const topics: Record<string, Topic> = untypedTopics;

function messageForTopic(
  topic: Topic,
  update: boolean,
  ephemeral: boolean,
  topicSelect: string,
  backButton: string
): MessageResponse {
  const children = Object.values(topics).filter(
    (child) => child.categoryId === topic.id
  );
  children.sort((a, b) => ((a.position || 0) > (b.position || 0) ? 1 : 0));

  return (
    <Message update={update} ephemeral={ephemeral}>
      {`
**${topic.title}**

${topic.content}
      `}
      <Row>
        <Button id={backButton + (topic.categoryId || "")} emoji="⬅">
          Back
        </Button>
        {(topic.links || []).map((link) => (
          <Button url={link.url}>{link.name}</Button>
        ))}
      </Row>
      {children.length !== 0 && (
        <Select
          id={topicSelect}
          min={1}
          max={1}
          placeholder="Select a topic ..."
        >
          {children.map((topic) => (
            <Option value={topic.id} description={topic.subtitle}>
              {topic.title}
            </Option>
          ))}
        </Select>
      )}
    </Message>
  );
}

function initialMessage(
  update: boolean,
  ephemeral: boolean,
  topicSelect: string,
  staticMenuButton?: string
): MessageResponse {
  const topLevelTopics = Object.values(topics).filter(
    (topic) => !topic.categoryId
  );
  topLevelTopics.sort((a, b) =>
    (a.position || 0) > (b.position || 0) ? 1 : -1
  );

  return (
    <Message ephemeral={ephemeral} update={update}>
      {`
Welcome to the **Xenon Help Center**! 

This is an **interactive FAQ** where you can find answers to common questions about Xenon. 
Use the Select Menu below to navigate through the FAQ. You go back to the previous by clicking the "Back" button.

*If you can't find the answer to your question please open an issue or pull request on [Github](https://github.com/Xenon-Bot/support).*
      `}
      <Select id={topicSelect} min={1} max={1} placeholder="Select a topic ...">
        {topLevelTopics.map((topic) => (
          <Option value={topic.id} description={topic.subtitle}>
            {topic.title}
          </Option>
        ))}
      </Select>
      {staticMenuButton && (
        <Row>
          <Button id={staticMenuButton} danger>
            Create Static Menu
          </Button>
        </Row>
      )}
    </Message>
  );
}

export function help(): CommandHandler<Env> {
  useDescription("Get support for the Xenon Bot");

  const topicSelect: string = useSelectMenu((interaction) => {
    // only update if the current message is ephemeral
    const update =
      interaction.message.flags !== undefined &&
      (interaction.message.flags & 64) === 64;

    const topic = topics[interaction.data.values[0]];
    if (topic) {
      return messageForTopic(topic, update, true, topicSelect, backButton);
    } else {
      return <Message>Unknown topic :(</Message>;
    }
  });

  const backButton: string = useButton((interaction) => {
    const topicId = interaction.data.custom_id.substring(backButton.length);
    const topic = topics[topicId];
    if (topic) {
      return messageForTopic(topic, true, true, topicSelect, backButton);
    } else {
      return initialMessage(true, true, topicSelect, staticMenuButton);
    }
  });

  const staticMenuButton = useButton(() => {
    return initialMessage(false, false, topicSelect, undefined);
  });

  return (interaction) => {
    function isAdmin() {
      return (BigInt(interaction.member?.permissions || 0) & 8n) === 8n;
    }

    return initialMessage(
      false,
      true,
      topicSelect,
      isAdmin() ? staticMenuButton : undefined
    );
  };
}
