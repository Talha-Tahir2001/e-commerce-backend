import { Query } from "mongoose";
import type { ParsedQs } from "qs";

class ApiFeatures<T> {
  constructor(
    public query: Query<T[], T>,
    public queryStr: ParsedQs
  ) {}

  search() {
    const keyword = this.queryStr["keyword"]
      ? {
          name: {
            $regex: this.queryStr["keyword"] as string,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find(keyword);
    return this;
  }

  filter() {
    const queryCopy: any = { ...this.queryStr };

    ["keyword", "page", "limit"].forEach(
      (key) => delete queryCopy[key]
    );

    let str = JSON.stringify(queryCopy);
    str = str.replace(/\b(gt|gte|lt|lte)\b/g, (k) => `$${k}`);

    this.query = this.query.find(JSON.parse(str));

    return this;
  }

  pagination(resultPerPage: number) {
    const page = Number(this.queryStr["page"]) || 1;

    this.query = this.query
      .limit(resultPerPage)
      .skip(resultPerPage * (page - 1));

    return this;
  }
}

export default ApiFeatures;