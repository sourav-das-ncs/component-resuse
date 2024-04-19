import csv


def main():
    with open('Q22900.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        Q22 = {row['Request']: row for row in csv_reader}
    # print(Q22)

    with open('P21900.csv', 'r') as file:
        csv_reader = csv.DictReader(file)
        P21 = {row['Request']: row for row in csv_reader}
    # print(P21)
    diff = []
    for TR in P21:
        if TR not in Q22:
            print(P21[TR])
            diff.append(P21[TR])

    with open('NotInQ22ButInP21.csv', 'w', encoding='UTF8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=diff[0].keys())
        writer.writeheader()
        writer.writerows(diff)
    pass


if __name__ == '__main__':
    main()
