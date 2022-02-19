# Xenonn Support Bot

This bots acts as an interactive FAQ and support bot for the [Xenon support server](https://xenon.bot/support).  
It's hosted on Cloudflare Workers loads and uses the [Slshx](https://github.com/mrbbot/slshx) framework.

All the content is loaded from the `topics` directory, updating the actual code should rarely be necessary.

### Contributing

Each `.yaml` file should contain a single topic. Topics can bested by putting them into sub-directories and adding a `_category.yaml` file to the directory. The `_category.yaml` file acts as the top-level topic for that category.
One category / directory should not have more than 25 topics / files (excluding the `_category.yaml`).

Topics (and categories) **must** follow the following structure:

```yaml
title: Some Topic # max. 100 chars
subtitle: Som subtitle for the topic # optional; max. 100 chars
description: | # max. 4096 chars
  Some test and **markdown**
  `with line breaks`
image: "https://example/test.png" # optional
links: # option; max. 4 link
  - name: Docs
    url: "https://wiki.xenon.bot"
```
