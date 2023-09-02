import { first, groupBy, rename, summarize, tidy } from '@tidyjs/tidy';
import { ParserHeaderTransformFunction, ParserOptionsArgs, parseString } from 'fast-csv';
// Since 2023, DevPost use a single "..." title for any team member after Team Member 1
// Therefore, modify the header titles to replace the "..." title and add in other Team Member
// So that we don't run into error "less titles than columns - column header mismatch"
// This "..." title is always guaranteed to be last title
const modifyDevPostHeaderRow: ParserHeaderTransformFunction = (oldHeaders) => {
  return oldHeaders
    .slice(0, -1)
    .concat(
      [2, 3, 4]
        .map((teamMemberNumber) => [
          `Team Member ${teamMemberNumber} First Name`,
          `Team Member ${teamMemberNumber} Last Name`,
          `Team Member ${teamMemberNumber} Email`,
        ])
        .flat(),
    );
};

type ParsedCsvRow<ParseOpts> = ParseOpts extends {
  headers: Exclude<ParserOptionsArgs['headers'], false>;
}
  ? Record<string, string>
  : string[];

function parseCsvString<T extends ParserOptionsArgs = ParserOptionsArgs, R = ParsedCsvRow<T>>(
  csvString: string,
  options?: T,
  rowProcessor?: (row: ParsedCsvRow<T>) => R,
): Promise<NonNullable<R>[]> {
  return new Promise((resolve, reject) => {
    const data: NonNullable<R>[] = [];

    parseString(csvString, options)
      .on('error', reject)
      .on('data', (row) => {
        const result: R = typeof rowProcessor !== 'undefined' ? rowProcessor(row) : row;
        if (result) data.push(result);
      })
      .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
        resolve(data);
      });
  });
}

export async function parseDevPostProjectsCsv(csvString: string) {
  const data = await parseCsvString(
    csvString,
    { headers: modifyDevPostHeaderRow, renameHeaders: true },
    (row) => (row['Project Status'] !== 'Draft' ? row : null),
  );

  const groupedByProjectTitle = tidy(
    data,
    rename({ 'Project Title': 'title', 'Submission Url': 'url' }),
    groupBy('title', [
      summarize(
        { categories: (records) => records.map((record) => record['Opt-In Prize']) },
        { rest: first },
      ),
    ]),
  );
  return groupedByProjectTitle;
}
