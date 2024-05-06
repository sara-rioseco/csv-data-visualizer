import { useEffect, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks'
import { toast } from 'sonner';
import { Data } from '../types';
import { searchData } from '../services/search';

const DEBOUNCE_TIME = 300

export const Search = ({ initialData }: { initialData: Data }) => {

  const [data, setData] = useState<Data>(initialData);

  const [search, setSearch] = useState<string>(()=>{
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get('q') ?? ''
  });

  const debouncedSearch = useDebounce(search, DEBOUNCE_TIME)

  useEffect(() => {
    const newPathname =
    debouncedSearch === '' ? window.location.pathname : `?q=${debouncedSearch}`;
    window.history.replaceState({}, '', newPathname);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!debouncedSearch) {
      setData(initialData)
      return
    }
    searchData(debouncedSearch).then(res => {
      const [err, newData] = res;
      if (err) {
        toast.error(err.message);
        return;
      }
      if (newData) {
        setData(newData)
        console.log('newData', newData);
        return
      }
    }).catch(e => {
      if (e instanceof Error) return [e]
    });
  }, [debouncedSearch, initialData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  return (
    <section>
      <h3>Search your data</h3>
      <form>
        <label htmlFor='search'>
          <input
            type='search'
            name='search'
            id='search'
            placeholder='Write here'
            onChange={handleSearch}
            defaultValue={search}
          />
        </label>
      </form>
      <ul>
        {data.map((row) => (
          <li key={row.id}>
            <article>
              {Object.entries(row).map(([key, value]) => <p key={`p_${row.id}_${key}`}><strong>{key}: </strong>{value}</p>)}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};
