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
  Embed,
} from "slshx";

interface Topic {
  title: string;
  subtitle?: string;
  description: string;
  links?: { name: string; url: string }[];
  image?: string;

  id: string;
  categoryId?: string;
}

//@ts-ignore
import untypedTopics from "../topics";

const topics: Record<string, Topic> = untypedTopics;

console.log(topics);

function messageForTopic(
  topic: Topic,
  update: boolean,
  ephemeral: boolean,
  topicSelect: string,
  homeButton: string
): MessageResponse {
  const children = Object.values(topics).filter(
    (child) => child.categoryId === topic.id
  );

  return (
    <Message update={update} ephemeral={ephemeral}>
      <Embed title={topic.title} color={0x478fce} image={topic.image}>
        {topic.description}
      </Embed>
      <Row>
        <Button id={homeButton} primary>
          Go Home
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

  return (
    <Message ephemeral={ephemeral} update={update}>
      <Embed title="Xenon Help Center" color={0x478fce}>
        {`
        Welcome to the Xenon Help Center! 
        
        This is an **interactive FAQ** where you can find answers to common questions about Xenon. 
        Use the Select Menu below to navigate through the FAQ. You can come back to this message at any point by clicking the "Home" button.
        
        *If you can't find the answer to your question please open an issue or pull request on [Github](https://github.com/Xenon-Bot/support).*
        `}
      </Embed>
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
    const topic = topics[interaction.data.values[0]];
    if (topic) {
      return messageForTopic(topic, true, true, topicSelect, homeButton);
    } else {
      return <Message>Unknown topic :(</Message>;
    }
  });

  const homeButton = useButton(() => {
    return initialMessage(true, true, topicSelect, staticMenuButton);
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
