import { RouteComponentProps } from "@reach/router";
import { Paper, SubHeading } from "eri";
import * as React from "react";
import { dateFormatter } from "../../../formatters";

const BLOG_POSTS = {
  "2021-01-01": {
    __html: require("./2021-01-01"),
    title: "New feature - calendar view",
  },
  "2020-12-30": {
    __html: require("./2020-12-30"),
    title: "New feature - exploration",
  },
};

export default function Blog(_: RouteComponentProps) {
  return (
    <Paper.Group>
      <Paper>
        <h2>Blog</h2>
        <p>Welcome to the MoodTracker blog!</p>
        <p>
          This space is for announcing interesting new features and
          developments. Less exciting stuff like bugfixes and performance
          improvements won&apos;t get a mention here.
        </p>
      </Paper>
      {Object.entries(BLOG_POSTS).map(([dateString, { __html, title }]) => (
        <Paper key={dateString}>
          <article itemScope itemType="http://schema.org/BlogPosting">
            <h2>
              {title}
              <SubHeading>
                <time
                  dateTime={dateString}
                  itemProp="dateCreated datePublished pubdate"
                >
                  {dateFormatter.format(new Date(dateString))}
                </time>
              </SubHeading>
            </h2>
            <div dangerouslySetInnerHTML={{ __html }} />
          </article>
        </Paper>
      ))}
    </Paper.Group>
  );
}