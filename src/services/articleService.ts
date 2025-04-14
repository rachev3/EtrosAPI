import Article from "../models/Article";
import { IArticle } from "../types/models/Article";
import { AppError } from "../middleware/errorHandler";

export async function createArticle(data: IArticle): Promise<IArticle> {
  const articleExists = await Article.findOne({ title: data.title });
  if (articleExists) {
    throw new AppError(
      "Article with this title already exists",
      400,
      "ARTICLE_EXISTS"
    );
  }
  const article = await Article.create(data);
  return article;
}

export async function updateArticle(
  id: string,
  data: Partial<IArticle>
): Promise<IArticle> {
  if (data.title) {
    const existingArticle = await Article.findOne({
      title: data.title,
      _id: { $ne: id },
    });
    if (existingArticle) {
      throw new AppError(
        "Article with this title already exists",
        400,
        "ARTICLE_EXISTS"
      );
    }
  }
  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!updatedArticle) {
    throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
  }
  return updatedArticle;
}

export async function deleteArticle(id: string): Promise<void> {
  const article = await Article.findByIdAndDelete(id);
  if (!article) {
    throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
  }
}

export async function getArticle(id: string): Promise<IArticle> {
  const article = await Article.findById(id);
  if (!article) {
    throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
  }
  return article;
}
