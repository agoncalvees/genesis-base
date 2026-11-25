import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import {
	FileDrop,
	FileList,
	FilePreview,
	ResizablePanels,
	validateFiles,
} from "../../src/design-system";

afterEach(cleanup);

const file = (name: string, type: string, content = "a") =>
	new File([content], name, { type });

test("validateFiles reports type, size and count errors as text", () => {
	const rules = { accept: [".csv", "image/*"], maxSize: 5, maxFiles: 2 };
	const result = validateFiles(
		[
			file("a.csv", "text/csv"),
			file("b.exe", "application/octet-stream"),
			file("c.png", "image/png", "too large"),
			file("d.PNG", "image/png"),
			file("e.csv", "text/csv"),
		],
		rules,
	);
	expect(result.accepted.map(({ name }) => name)).toEqual(["a.csv", "d.PNG"]);
	expect(result.errors).toEqual([
		"“b.exe” is not an accepted type. Use .csv, image/*.",
		"“c.png” is 9 bytes; the limit is 5 bytes.",
		"“e.csv” was not added: the limit is 2 files.",
	]);
});

test("file drop opens the picker from a button, accepts drops and shows textual errors", async () => {
	const user = userEvent.setup();
	const onFiles = vi.fn();
	render(
		<FileDrop
			label="Files"
			accept={[".txt"]}
			maxSize={100}
			onFiles={onFiles}
		/>,
	);
	const group = screen.getByRole("group", { name: "Files" });
	expect(group.getAttribute("aria-describedby")).toBeTruthy();
	const button = within(group).getByRole("button", { name: "Choose files" });
	const input = group.querySelector<HTMLInputElement>("input[type=file]");
	const click = vi.spyOn(input as HTMLInputElement, "click");
	button.focus();
	await user.keyboard("{Enter}");
	expect(click).toHaveBeenCalled();

	await user.upload(input as HTMLInputElement, file("notes.txt", "text/plain"));
	expect(onFiles).toHaveBeenCalledWith([
		expect.objectContaining({ name: "notes.txt" }),
	]);

	fireEvent.drop(group, {
		dataTransfer: { files: [file("run.sh", "text/x-sh")] },
	});
	expect(screen.getByRole("alert").textContent).toContain(
		"“run.sh” is not an accepted type",
	);
	expect(onFiles).toHaveBeenCalledTimes(1);
});

test("file previews read text and CSV as text, use revoked object URLs for images", async () => {
	const create = vi.fn(() => "blob:preview");
	const revoke = vi.fn();
	Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
	const csv = file(
		"data.csv",
		"text/csv",
		"a,b\n1,2\n3,4\n5,6\n7,8\n9,10\n<script>x</script>",
	);
	const { unmount } = render(
		<>
			<FilePreview file={csv} lines={3} />
			<FilePreview file={file("pic.png", "image/png")} />
			<FilePreview file={file("bin.zip", "application/zip")} />
		</>,
	);
	await waitFor(() => expect(screen.getByText(/3 rows shown/)).toBeTruthy());
	expect(
		screen.getByText("a,b 1,2 3,4", {
			normalizer: (t) => t.replace(/\s+/g, " "),
		}),
	).toBeTruthy();
	expect(document.querySelector("script")).toBeNull();
	expect(
		screen.getByRole("img", { name: "Preview of pic.png" }).getAttribute("src"),
	).toBe("blob:preview");
	expect(screen.getByText(/No preview for this type/)).toBeTruthy();
	unmount();
	expect(revoke).toHaveBeenCalledWith("blob:preview");
});

test("file list removes files by accessible name", async () => {
	const user = userEvent.setup();
	const onRemove = vi.fn();
	render(
		<FileList
			files={[file("one.bin", ""), file("two.bin", "")]}
			onRemove={onRemove}
			preview={false}
		/>,
	);
	const list = screen.getByRole("list", { name: "Selected files" });
	expect(within(list).getAllByRole("listitem")).toHaveLength(2);
	await user.click(screen.getByRole("button", { name: "Remove two.bin" }));
	expect(onRemove).toHaveBeenCalledWith(1);
	expect(list).toBe(document.activeElement);
});

test("resizable panels resize from the keyboard within bounds and report commits", async () => {
	const user = userEvent.setup();
	const onSizeChange = vi.fn();
	render(
		<ResizablePanels
			label="Resize"
			start="A"
			end="B"
			defaultSize={50}
			min={30}
			max={60}
			step={5}
			onSizeChange={onSizeChange}
		/>,
	);
	const separator = screen.getByRole("separator", { name: "Resize" });
	expect(separator.getAttribute("aria-valuenow")).toBe("50");
	expect(separator.getAttribute("aria-valuemin")).toBe("30");
	expect(separator.getAttribute("aria-valuemax")).toBe("60");
	separator.focus();
	await user.keyboard("{ArrowRight}");
	expect(separator.getAttribute("aria-valuenow")).toBe("55");
	await user.keyboard("{End}{ArrowRight}");
	expect(separator.getAttribute("aria-valuenow")).toBe("60");
	await user.keyboard("{Home}");
	expect(separator.getAttribute("aria-valuenow")).toBe("30");
	await act(async () => {
		await user.keyboard("{ArrowLeft}");
	});
	expect(onSizeChange.mock.calls.map(([size]) => size)).toEqual([
		55, 60, 60, 30, 30,
	]);
});
