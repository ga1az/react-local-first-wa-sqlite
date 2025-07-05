import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@powersync/tanstack-react-query";
import { db } from "@/lib/db";
import { useState, useEffect, useRef } from "react";
import { usePowerSync } from "@powersync/react";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const [newTitle, setNewTitle] = useState("");
	const [newContent, setNewContent] = useState("");
	const [selectedPostIndex, setSelectedPostIndex] = useState(0);
	const postsListRef = useRef<HTMLDivElement>(null);

	const powerSync = usePowerSync();

	const {
		data: posts,
		isLoading,
		isFetching,
		error,
	} = useQuery({
		queryKey: ["posts"],
		query: db.selectFrom("post").selectAll(),
	});

	const selectedPost = posts?.[selectedPostIndex];
	const prevPost = posts?.[selectedPostIndex - 1];
	const nextPost = posts?.[selectedPostIndex + 1];

	// Main query for selected post data
	const {
		data: postData,
		isLoading: isLoadingPostData,
		isFetching: isFetchingPostData,
	} = useQuery({
		queryKey: ["post_data", selectedPost?.id || ""],
		query: db
			.selectFrom("post_data")
			.where("post_id", "=", selectedPost?.id || "")
			.selectAll(),
		enabled: !!selectedPost,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Prefetch previous post data
	useQuery({
		queryKey: ["post_data", prevPost?.id || ""],
		query: db
			.selectFrom("post_data")
			.where("post_id", "=", prevPost?.id || "")
			.selectAll(),
		enabled: !!prevPost,
		staleTime: 5 * 60 * 1000,
	});

	// Prefetch next post data
	useQuery({
		queryKey: ["post_data", nextPost?.id || ""],
		query: db
			.selectFrom("post_data")
			.where("post_id", "=", nextPost?.id || "")
			.selectAll(),
		enabled: !!nextPost,
		staleTime: 5 * 60 * 1000,
	});

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!posts || posts.length === 0) return;

			switch (e.key) {
				case "j":
					e.preventDefault();
					setSelectedPostIndex((prev) =>
						prev < posts.length - 1 ? prev + 1 : prev,
					);
					break;
				case "k":
					e.preventDefault();
					setSelectedPostIndex((prev) => (prev > 0 ? prev - 1 : prev));
					break;
				case "ArrowDown":
					e.preventDefault();
					setSelectedPostIndex((prev) =>
						prev < posts.length - 1 ? prev + 1 : prev,
					);
					break;
				case "ArrowUp":
					e.preventDefault();
					setSelectedPostIndex((prev) => (prev > 0 ? prev - 1 : prev));
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [posts]);

	// Reset selected index when posts change
	useEffect(() => {
		if (posts && posts.length > 0) {
			setSelectedPostIndex((prev) => (prev >= posts.length ? 0 : prev));
		}
	}, [posts]);

	// Auto-scroll to selected post
	useEffect(() => {
		if (postsListRef.current && posts && posts.length > 0) {
			const selectedElement = postsListRef.current.children[
				selectedPostIndex
			] as HTMLElement;
			if (selectedElement) {
				selectedElement.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
				});
			}
		}
	}, [selectedPostIndex, posts]);

	const createPostData = async (postId: string) => {
		const dataEntries = [
			{ key: "author", value: "Admin User", data_type: "string" },
			{
				key: "created_at",
				value: new Date().toISOString(),
				data_type: "datetime",
			},
			{ key: "status", value: "published", data_type: "string" },
			{
				key: "views",
				value: Math.floor(Math.random() * 1000).toString(),
				data_type: "number",
			},
			{
				key: "tags",
				value: JSON.stringify(["web", "tech", "tutorial"]),
				data_type: "json",
			},
			{
				key: "priority",
				value: Math.floor(Math.random() * 5 + 1).toString(),
				data_type: "number",
			},
			{ key: "category", value: "Technology", data_type: "string" },
			{
				key: "featured",
				value: Math.random() > 0.5 ? "true" : "false",
				data_type: "boolean",
			},
		];

		const postDataRecords = dataEntries.map((entry) => ({
			id: crypto.randomUUID(),
			post_id: postId,
			key: entry.key,
			value: entry.value,
			data_type: entry.data_type,
		}));

		await db.insertInto("post_data").values(postDataRecords).execute();
	};

	const createPost = async () => {
		const title = newTitle.trim() || "Untitled Post";
		const content = newContent.trim() || "No content provided";
		const postId = crypto.randomUUID();

		await db
			.insertInto("post")
			.values({
				id: postId,
				title,
				content,
			})
			.execute();

		// Create associated POST_DATA
		await createPostData(postId);

		setNewTitle("");
		setNewContent("");
	};

	const deletePost = async (id: string) => {
		// Delete associated POST_DATA first
		await db.deleteFrom("post_data").where("post_id", "=", id).execute();
		// Then delete the post
		await db.deleteFrom("post").where("id", "=", id).execute();
	};

	const createRandomPost = async () => {
		const titles = [
			"My First Blog Post",
			"Learning React",
			"TypeScript Tips",
			"Database Design",
			"Web Development",
			"PowerSync Tutorial",
			"JavaScript Patterns",
			"UI/UX Best Practices",
		];
		const contents = [
			"This is a sample blog post about web development and modern frameworks.",
			"Today I learned about React hooks and how they simplify state management.",
			"TypeScript provides excellent type safety for JavaScript applications.",
			"Database design is crucial for building scalable applications.",
			"Modern web development requires understanding of various technologies.",
			"PowerSync makes offline-first applications much easier to build.",
			"JavaScript patterns help write more maintainable code.",
			"Good UI/UX design improves user experience significantly.",
		];

		const randomTitle = titles[Math.floor(Math.random() * titles.length)];
		const randomContent = contents[Math.floor(Math.random() * contents.length)];
		const postId = crypto.randomUUID();

		await db
			.insertInto("post")
			.values({
				id: postId,
				title: randomTitle,
				content: randomContent,
			})
			.execute();

		// Create associated POST_DATA
		await createPostData(postId);
	};

	const seedRandomPosts = async () => {
		const titles = [
			"Getting Started with React",
			"Advanced TypeScript Techniques",
			"Building Modern Web Apps",
			"Database Optimization Tips",
			"Frontend Architecture",
			"API Design Best Practices",
			"Performance Optimization",
			"Testing Strategies",
			"Security Considerations",
			"DevOps Fundamentals",
		];

		const contentTemplates = [
			"This comprehensive guide covers the fundamentals of modern web development, including best practices, common pitfalls, and advanced techniques.",
			"In this detailed tutorial, we explore various approaches to solving complex problems in software development.",
			"A deep dive into the latest technologies and frameworks that are shaping the future of web development.",
			"Learn about optimization techniques that can significantly improve your application's performance and user experience.",
			"This article discusses important architectural decisions and how they impact the scalability of your applications.",
		];

		// Generate 50 posts (reduced for better performance with POST_DATA)
		const posts = Array.from({ length: 50 }, (_, index) => {
			const randomTitle = titles[Math.floor(Math.random() * titles.length)];
			const randomContent =
				contentTemplates[Math.floor(Math.random() * contentTemplates.length)];

			return {
				id: crypto.randomUUID(),
				title: `${randomTitle} ${index + 1}`,
				content: `${randomContent} Post #${index + 1}`,
			};
		});

		await db.insertInto("post").values(posts).execute();

		// Create POST_DATA for each post
		for (const post of posts) {
			await createPostData(post.id);
		}
	};

	const deleteDatabase = async () => {
		await powerSync.disconnectAndClear();
	};

	// Optimized loading state - only show if it's actually taking time
	const isActuallyLoading = isLoadingPostData && !postData;

	return (
		<div className="min-h-screen bg-black text-green-400 p-4 font-mono">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="border border-green-400 p-4 mb-4 bg-gray-900">
					<h1 className="text-xl font-bold mb-2 text-green-300">
						PowerSync Post Manager [TUI] - Optimized
					</h1>
					<p className="text-green-600 text-sm">
						Navigate: j/k or ↑/↓ | Posts: {posts?.length || 0} | Selected:{" "}
						{selectedPost?.title || "None"}
					</p>

					{/* Status */}
					<div className="mt-3 text-sm">
						<span className={error ? "text-red-400" : "text-green-400"}>
							{error ? `[ERROR] ${error.message}` : "[OK] Connected"}
						</span>
						{isFetching && (
							<span className="text-yellow-400 ml-3 opacity-70">
								[SYNC POSTS]
							</span>
						)}
						{isLoading && (
							<span className="text-blue-400 ml-3 opacity-70">
								[LOAD POSTS]
							</span>
						)}
						{isFetchingPostData && (
							<span className="text-purple-400 ml-3 opacity-50">
								[PREFETCH]
							</span>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
					{/* Control Panel */}
					<div className="lg:col-span-3 border border-green-400 p-4 bg-gray-900">
						<h2 className="font-bold mb-3 text-green-300">[CREATE POST]</h2>

						<div className="space-y-3">
							<div>
								<label
									htmlFor="title"
									className="block text-sm mb-1 text-green-600"
								>
									Title:
								</label>
								<input
									id="title"
									type="text"
									value={newTitle}
									onChange={(e) => setNewTitle(e.target.value)}
									placeholder="Enter post title"
									className="w-full px-2 py-1 border border-green-400 text-sm bg-black text-green-400 placeholder-green-700"
								/>
							</div>

							<div>
								<label
									htmlFor="content"
									className="block text-sm mb-1 text-green-600"
								>
									Content:
								</label>
								<textarea
									id="content"
									value={newContent}
									onChange={(e) => setNewContent(e.target.value)}
									placeholder="Enter post content"
									rows={4}
									className="w-full px-2 py-1 border border-green-400 text-sm bg-black text-green-400 placeholder-green-700 resize-none"
								/>
							</div>

							<button
								type="button"
								onClick={createPost}
								className="w-full bg-green-800 text-green-100 py-2 px-3 text-sm hover:bg-green-700 border border-green-400 transition-colors"
							>
								[CREATE + DATA]
							</button>

							<button
								type="button"
								onClick={createRandomPost}
								className="w-full bg-yellow-800 text-yellow-100 py-2 px-3 text-sm hover:bg-yellow-700 border border-yellow-400 transition-colors"
							>
								[RANDOM + DATA]
							</button>

							<button
								type="button"
								onClick={seedRandomPosts}
								className="w-full bg-blue-800 text-blue-100 py-2 px-3 text-sm hover:bg-blue-700 border border-blue-400 transition-colors"
							>
								[SEED 50 + DATA]
							</button>

							<button
								type="button"
								onClick={deleteDatabase}
								className="w-full bg-red-800 text-red-100 py-2 px-3 text-sm hover:bg-red-700 border border-red-400 transition-colors"
							>
								[DELETE DB]
							</button>
						</div>
					</div>

					{/* Posts List */}
					<div className="lg:col-span-4 border border-green-400 p-4 bg-gray-900">
						<h2 className="font-bold mb-3 text-green-300">
							[POSTS] ({posts?.length || 0})
						</h2>

						{isLoading ? (
							<div className="text-center py-8 text-sm text-green-600">
								[LOADING POSTS...]
							</div>
						) : !posts || posts.length === 0 ? (
							<div className="text-center py-8 text-sm text-green-600">
								[NO POSTS FOUND]
							</div>
						) : (
							<div
								className="space-y-1 max-h-96 overflow-y-auto"
								ref={postsListRef}
							>
								{posts.map((post, index) => (
									<button
										key={post.id}
										type="button"
										onClick={() => setSelectedPostIndex(index)}
										aria-label={`Select post: ${post.title}`}
										className={`border p-2 cursor-pointer text-left w-full transition-all duration-150 ${
											index === selectedPostIndex
												? "border-green-300 bg-green-900 text-green-100 transform scale-[1.02]"
												: "border-green-700 bg-gray-800 text-green-400 hover:border-green-600 hover:bg-gray-700"
										}`}
									>
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<div className="font-medium text-sm truncate">
													{index === selectedPostIndex ? "► " : "  "}
													{post.title}
												</div>
												<div className="text-xs text-green-600 mt-1">
													{post.id.slice(0, 8)}...
												</div>
											</div>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													deletePost(post.id);
												}}
												className="text-red-400 hover:text-red-300 text-xs ml-2 opacity-60 hover:opacity-100 transition-opacity"
											>
												[X]
											</button>
										</div>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Post Data Viewer */}
					<div className="lg:col-span-5 border border-green-400 p-4 bg-gray-900">
						<h2 className="font-bold mb-3 text-green-300">
							[POST_DATA] ({(postData || []).length})
						</h2>

						{!selectedPost ? (
							<div className="text-center py-8 text-sm text-green-600">
								[SELECT A POST TO VIEW DATA]
							</div>
						) : (
							<div className="space-y-3">
								{/* Post Header - Always visible */}
								<div className="border border-green-600 p-3 bg-black">
									<div className="text-sm text-green-600 mb-2">POST INFO:</div>
									<div className="text-green-300 font-medium text-sm">
										{selectedPost.title}
									</div>
									<div className="text-xs text-green-500 mt-1">
										ID: {selectedPost.id}
									</div>
								</div>

								{/* Post Data */}
								<div className="border border-green-600 bg-black max-h-80 overflow-y-auto">
									<div className="p-3 border-b border-green-700">
										<div className="text-sm text-green-600 flex items-center">
											DATA RECORDS:
											{isActuallyLoading && (
												<span className="ml-2 text-xs text-yellow-400 animate-pulse">
													[Loading...]
												</span>
											)}
										</div>
									</div>

									{/* Skeleton loading for better UX */}
									{isActuallyLoading ? (
										<div className="space-y-2 p-2">
											{Array.from({ length: 8 }, () => (
												<div
													key={crypto.randomUUID()}
													className="animate-pulse"
												>
													<div className="grid grid-cols-3 gap-2">
														<div className="h-4 bg-green-800 rounded opacity-30" />
														<div className="h-4 bg-green-800 rounded opacity-20" />
														<div className="h-4 bg-green-800 rounded opacity-10" />
													</div>
												</div>
											))}
										</div>
									) : (postData || []).length === 0 ? (
										<div className="text-center py-8 text-sm text-green-600">
											[NO DATA FOUND]
										</div>
									) : (
										<div className="transition-opacity duration-200">
											{(postData || []).map((data, index) => (
												<div
													key={data.id}
													className="p-2 border-b border-green-800 last:border-b-0"
												>
													<div className="grid grid-cols-3 gap-2 text-xs">
														<div className="text-green-500">{data.key}:</div>
														<div className="text-green-400 truncate">
															{data.value}
														</div>
														<div className="text-green-600">
															[{data.data_type}]
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Query Status */}
								<div className="border border-green-600 p-3 bg-black">
									<div className="text-sm text-green-600 mb-2">
										QUERY STATUS:
									</div>
									<div className="text-green-500 text-xs space-y-1">
										<div>Records: {(postData || []).length}</div>
										<div>Post ID: {selectedPost.id.slice(0, 8)}...</div>
										<div>
											Status:{" "}
											{isActuallyLoading
												? "Loading..."
												: isFetchingPostData
													? "Prefetching..."
													: "Ready"}
										</div>
										<div className="text-green-600">Cache: Active</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="mt-4 text-xs text-green-600 text-center">
					Use J/K or Arrow Keys to navigate | Click to select | Optimized with
					prefetching & caching
				</div>
			</div>
		</div>
	);
}
